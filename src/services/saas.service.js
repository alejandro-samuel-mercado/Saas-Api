const prisma = require('../config/prisma');
const { invalidateTenantCache } = require('../middlewares/tenant.middleware');
const bcrypt = require('bcryptjs');

class SaaSService {

    // ==================== CUSTOMERS ====================
    async getAllCustomers() {
        const tenants = await prisma.tenant.findMany({
            include: { plan: true, _count: { select: { payments: true } } },
            orderBy: { createdAt: 'desc' }
        });

        // Agrupar por ownerEmail
        const customersMap = new Map();
        for (const t of tenants) {
            if (!customersMap.has(t.ownerEmail)) {
                customersMap.set(t.ownerEmail, {
                    name: t.ownerName,
                    email: t.ownerEmail,
                    phone: t.ownerPhone || null,
                    businessesCount: 0,
                    tenants: [],
                    totalMonthlyPrice: 0
                });
            }
            
            const customer = customersMap.get(t.ownerEmail);
            customer.businessesCount += 1;
            customer.totalMonthlyPrice += (t.monthlyPrice ? Number(t.monthlyPrice) : 0);
            customer.tenants.push(t);
        }

        return Array.from(customersMap.values());
    }

    async getCustomerByEmail(email) {
        const tenants = await prisma.tenant.findMany({
            where: { ownerEmail: email },
            include: { 
                plan: true, 
                rubro: true, 
                payments: { orderBy: { paidAt: 'desc' }, take: 10 }
            },
            orderBy: { createdAt: 'desc' }
        });

        if (!tenants || tenants.length === 0) {
            throw { statusCode: 404, message: 'Cliente no encontrado' };
        }

        const tenantIds = tenants.map(t => t.id);
        const [gateways, storeConfigs] = await Promise.all([
            prisma.paymentGateway.findMany({
                where: { tenantId: { in: tenantIds }, isActive: true },
                select: { tenantId: true, name: true }
            }),
            prisma.storeConfig.findMany({
                where: { tenantId: { in: tenantIds } },
                select: { tenantId: true, enableWhatsappCheckout: true }
            })
        ]);

        const tenantsWithGateways = tenants.map(t => {
            const config = storeConfigs.find(c => c.tenantId === t.id);
            const activeGateways = gateways.filter(g => g.tenantId === t.id).map(g => g.name);
            if (config?.enableWhatsappCheckout) {
                activeGateways.push('WhatsApp Checkout');
            }
            return {
                ...t,
                activeGateways
            };
        });

        const customer = {
            name: tenants[0].ownerName,
            email: tenants[0].ownerEmail,
            phone: tenants[0].ownerPhone || null,
            businessesCount: tenants.length,
            tenants: tenantsWithGateways,
            totalMonthlyPrice: tenants.reduce((acc, t) => acc + (t.monthlyPrice ? Number(t.monthlyPrice) : 0), 0)
        };

        return customer;
    }

    // ==================== TENANTS ====================

    async getAllTenants(filters = {}) {
        const where = {};
        if (filters.status) where.status = filters.status;
        if (filters.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { ownerName: { contains: filters.search, mode: 'insensitive' } },
                { ownerEmail: { contains: filters.search, mode: 'insensitive' } },
                { slug: { contains: filters.search, mode: 'insensitive' } }
            ];
        }

        const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

        // Limpiar automáticamente planes pendientes expirados (>48h)
        await prisma.tenant.updateMany({
            where: {
                pendingPlanRequestedAt: { lt: fortyEightHoursAgo }
            },
            data: {
                pendingPlanId: null,
                pendingPlanRequestedAt: null
            }
        });

        const [tenants, total] = await Promise.all([
            prisma.tenant.findMany({
                where,
                include: { plan: true, pendingPlan: true, rubro: true, _count: { select: { payments: true } } },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.tenant.count({ where })
        ]);

        return { tenants, total };
    }

    async getTenantById(id) {
        const tenant = await prisma.tenant.findUnique({
            where: { id },
            include: {
                plan: true,
                rubro: true,
                payments: { orderBy: { paidAt: 'desc' }, take: 12 }
            }
        });
        if (!tenant) throw { statusCode: 404, message: 'Tenant no encontrado' };

        // Obtener estadísticas del tenant
        const [productCount, userCount, saleCount, branchCount] = await Promise.all([
            prisma.product.count({ where: { tenantId: id, isDeleted: false } }),
            prisma.user.count({ where: { tenantId: id } }),
            prisma.sale.count({ where: { tenantId: id } }),
            prisma.branch.count({ where: { tenantId: id } })
        ]);

        return { ...tenant, stats: { productCount, userCount, saleCount, branchCount } };
    }

    async createTenant(data) {
        const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

        // Verificar slug único
        const existing = await prisma.tenant.findUnique({ where: { slug } });
        if (existing) throw { statusCode: 400, message: 'Ya existe un negocio con ese slug.' };

        let initialModules = [];
        if (data.enabledModules) {
            initialModules = data.enabledModules;
        } else if (data.planId) {
            const plan = await prisma.saaSPlan.findUnique({ where: { id: parseInt(data.planId) }});
            if (plan) initialModules = plan.enabledModules;
        }

        const tenant = await prisma.tenant.create({
            data: {
                name: data.name,
                slug,
                ownerName: data.ownerName,
                ownerEmail: data.ownerEmail,
                ownerPhone: data.ownerPhone || null,
                domain: data.domain || null,
                planId: data.planId || null,
                monthlyPrice: data.monthlyPrice || null,
                subscriptionEnd: data.subscriptionEnd || null,
                status: 'PAUSED',
                pauseReason: 'Pendiente de pago inicial',
                notes: data.notes || null,
                ownerPassword: data.ownerPassword || 'admin123',
                rubroId: data.rubroId ? parseInt(data.rubroId) : null,
                enabledModules: initialModules,
            },
            include: { plan: true }
        });

        // Inicializar datos base del tenant
        await this.initializeTenant(tenant.id, data.ownerPassword, data.rubroId ? parseInt(data.rubroId) : null);

        return tenant;
    }

    async updateTenant(id, data) {
        const existingTenant = await prisma.tenant.findUnique({ where: { id } });
        if (!existingTenant) throw { statusCode: 404, message: 'Tenant no encontrado' };

        let updateData = {
            name: data.name,
            ownerName: data.ownerName,
            ownerEmail: data.ownerEmail,
            ownerPhone: data.ownerPhone,
            domain: data.domain,
            subscriptionEnd: data.subscriptionEnd,
            notes: data.notes,
        };

        if (data.planId && existingTenant.planId && data.planId !== existingTenant.planId) {
            if (existingTenant.pendingPlanId) {
                throw { statusCode: 400, message: 'Ya existe una solicitud de cambio de plan pendiente para este negocio' };
            }
            updateData.pendingPlanId = data.planId;
            updateData.pendingPlanRequestedAt = new Date();
        } else if (data.planId !== undefined) {
            updateData.planId = data.planId;
            updateData.monthlyPrice = data.monthlyPrice;
        }

        // SEGURIDAD: El rubro es PERMANENTE una vez asignado. No se puede cambiar.
        // Solo se puede asignar si el tenant aún no tiene rubro (primera configuración).
        if (data.rubroId !== undefined) {
            if (existingTenant.rubroId && existingTenant.rubroId !== (data.rubroId ? parseInt(data.rubroId) : null)) {
                throw { statusCode: 400, message: 'El rubro de un negocio no puede modificarse una vez asignado. El rubro define la estructura de datos del negocio.' };
            }
            if (!existingTenant.rubroId && data.rubroId) {
                // Solo se permite asignar si no tenía ninguno
                updateData.rubroId = parseInt(data.rubroId);
            }
        }

        if (data.enabledModules !== undefined) {
            updateData.enabledModules = data.enabledModules;
        } else if (data.planId && data.planId !== existingTenant.planId) {
            const newPlan = await prisma.saaSPlan.findUnique({ where: { id: parseInt(data.planId) } });
            if (newPlan) {
                const currentModules = existingTenant.enabledModules || [];
                const allowedModules = newPlan.enabledModules || [];
                updateData.enabledModules = currentModules.filter(m => allowedModules.includes(m));
            }
        }

        if (data.ownerPassword) {
            updateData.ownerPassword = data.ownerPassword;
        }

        const tenant = await prisma.tenant.update({
            where: { id },
            data: updateData,
            include: { plan: true, pendingPlan: true, rubro: true }
        });

        if (data.ownerPassword || data.ownerEmail || data.ownerName) {
            const superAdminRole = await prisma.role.findFirst({ where: { tenantId: id, name: 'SUPER_ADMIN' } });
            if (superAdminRole) {
                const updateUserData = {};
                if (data.ownerPassword) {
                    updateUserData.password = await bcrypt.hash(data.ownerPassword, 10);
                }
                if (data.ownerEmail) {
                    updateUserData.email = data.ownerEmail;
                }
                if (data.ownerName) {
                    updateUserData.name = data.ownerName;
                }

                if (Object.keys(updateUserData).length > 0) {
                    await prisma.user.updateMany({
                        where: { tenantId: id, roleId: superAdminRole.id },
                        data: updateUserData
                    });
                }
            }
        }

        invalidateTenantCache(id);
        return tenant;
    }

    async pauseTenant(id, reason = 'manual') {
        const tenant = await prisma.tenant.update({
            where: { id },
            data: { status: 'PAUSED', pauseReason: reason }
        });
        // También activar modo mantenimiento en el StoreConfig del tenant
        await prisma.storeConfig.updateMany({
            where: { tenantId: id },
            data: { maintenanceMode: true }
        });
        invalidateTenantCache(id);
        return tenant;
    }

    async resumeTenant(id) {
        const tenant = await prisma.tenant.update({
            where: { id },
            data: { status: 'ACTIVE', pauseReason: null }
        });
        // Desactivar modo mantenimiento
        await prisma.storeConfig.updateMany({
            where: { tenantId: id },
            data: { maintenanceMode: false }
        });
        invalidateTenantCache(id);
        return tenant;
    }

    async deleteTenant(id) {
        // No borramos datos, solo marcamos como SUSPENDED
        const tenant = await prisma.tenant.update({
            where: { id },
            data: { status: 'SUSPENDED', pauseReason: 'deleted_by_owner' }
        });
        invalidateTenantCache(id);
        return tenant;
    }

    /**
     * Inicializa datos base para un tenant nuevo:
     * - StoreConfig
     * - Roles (SUPER_ADMIN, ADMIN, EMPLOYEE, CUSTOMER)
     * - Branch default
     * - Usuario admin inicial
     */
    async initializeTenant(tenantId, ownerPassword = 'admin123', rubroId = null) {
        // 1. StoreConfig
        await prisma.storeConfig.create({
            data: { tenantId }
        });

        // 2. Roles
        const roles = ['SUPER_ADMIN', 'ADMIN', 'EMPLOYEE', 'CUSTOMER'];
        const createdRoles = {};
        for (const roleName of roles) {
            const role = await prisma.role.create({
                data: { tenantId, name: roleName, description: roleName }
            });
            createdRoles[roleName] = role;
        }

        // 3. Branch default
        const branch = await prisma.branch.create({
            data: {
                tenantId,
                name: 'Sucursal Principal',
                code: 'MAIN',
                address: 'Dirección pendiente',
                city: 'Ciudad',
                state: 'Provincia',
                country: 'Argentina',
                phone: '000-000-0000',
                operatingHours: {},
                isHeadquarters: true
            }
        });

        // 4. Usuario admin inicial
        const hashedPassword = await bcrypt.hash(ownerPassword || 'admin123', 10);
        const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });

        await prisma.user.create({
            data: {
                tenantId,
                name: tenant?.ownerName || 'Administrador',
                email: tenant?.ownerEmail || `admin@${tenantId}.com`,
                password: hashedPassword,
                roleId: createdRoles['SUPER_ADMIN'].id,
                branchId: branch.id,
                status: 'ACTIVE',
                emailVerified: true
            }
        });

        // 5. Moneda base
        await prisma.currency.create({
            data: {
                tenantId,
                code: 'ARS',
                symbol: '$',
                exchangeRateToBase: 1.0,
                isActive: true
            }
        });

        // 6. Sembrado de Plantillas (Onboarding Automático)
        if (rubroId) {
            await this.seedTenantTemplates(tenantId, rubroId);
        }

        // 7. Gateways de Pago Multi-Tenant
        await prisma.paymentGateway.createMany({
            data: [
                {
                    tenantId,
                    name: 'Mercado Pago',
                    slug: 'mercadopago',
                    isActive: false,
                    isGlobalFallback: false,
                    config: {}
                },
                {
                    tenantId,
                    name: 'Stripe',
                    slug: 'stripe',
                    isActive: false,
                    isGlobalFallback: false,
                    config: {}
                },
                {
                    tenantId,
                    name: 'PayPal',
                    slug: 'paypal',
                    isActive: false,
                    isGlobalFallback: false,
                    config: {}
                }
            ]
        });

        return { message: 'Tenant inicializado correctamente' };
    }

    // ==================== PLANTILLAS (ONBOARDING) ====================

    async seedTenantTemplates(tenantId, rubroId) {
        const rubro = await prisma.rubro.findUnique({ where: { id: rubroId } });
        if (!rubro) return;

        const templates = {
            perfumes: {
                categories: [
                    { name: 'Fragancias Femeninas', slug: 'fragancias-femeninas' },
                    { name: 'Fragancias Masculinas', slug: 'fragancias-masculinas' },
                    { name: 'Sets de Regalo', slug: 'sets-de-regalo' }
                ],
                products: [
                    {
                        name: 'Perfume de Muestra 100ml',
                        description: 'Esta es una fragancia de muestra creada automáticamente. Puedes editarla o eliminarla.',
                        brand: 'Marca Demo',
                        basePrice: 15000,
                        type: 'PHYSICAL',
                        characteristics: [{ key: 'Concentración', value: 'Eau de Parfum' }, { key: 'Duración', value: '8 horas' }]
                    }
                ]
            },
            inmuebles: {
                categories: [
                    { name: 'Departamentos', slug: 'departamentos' },
                    { name: 'Casas', slug: 'casas' },
                    { name: 'Lotes y Terrenos', slug: 'lotes-y-terrenos' }
                ],
                products: [
                    {
                        name: 'Casa Moderna de Muestra',
                        description: 'Propiedad de demostración. 3 Habitaciones, 2 Baños, cochera doble.',
                        brand: 'Inmobiliaria Demo',
                        basePrice: 150000,
                        type: 'PHYSICAL',
                        saleMode: 'VENTA',
                        characteristics: [{ key: 'Habitaciones', value: '3' }, { key: 'Baños', value: '2' }, { key: 'Metros Cuadrados', value: '120m2' }]
                    }
                ]
            },
            relojes: {
                categories: [
                    { name: 'Relojes Analógicos', slug: 'relojes-analogicos' },
                    { name: 'Smartwatches', slug: 'smartwatches' },
                    { name: 'Correas y Accesorios', slug: 'correas-y-accesorios' }
                ],
                products: [
                    {
                        name: 'Reloj Automático Demo',
                        description: 'Reloj de muestra con movimiento automático y cristal de zafiro.',
                        brand: 'WatchBrand',
                        basePrice: 45000,
                        type: 'PHYSICAL',
                        characteristics: [{ key: 'Movimiento', value: 'Automático' }, { key: 'Cristal', value: 'Zafiro' }]
                    }
                ]
            },
            barberias: {
                categories: [
                    { name: 'Cortes de Cabello', slug: 'cortes-cabello' },
                    { name: 'Cuidado de Barba', slug: 'cuidado-barba' },
                    { name: 'Productos Capilares', slug: 'productos-capilares' }
                ],
                products: [
                    {
                        name: 'Corte Clásico + Barba (Demo)',
                        description: 'Servicio de demostración. Incluye lavado y perfilado.',
                        brand: 'Servicio',
                        basePrice: 5000,
                        type: 'SERVICE',
                        characteristics: [{ key: 'Duración Estimada', value: '45 minutos' }]
                    }
                ]
            },
            mascotas: {
                categories: [
                    { name: 'Alimentos para Perros', slug: 'alimentos-perros' },
                    { name: 'Alimentos para Gatos', slug: 'alimentos-gatos' },
                    { name: 'Accesorios y Juguetes', slug: 'accesorios-y-juguetes' }
                ],
                products: [
                    {
                        name: 'Alimento Premium Adulto 15kg (Demo)',
                        description: 'Alimento balanceado de demostración para razas medianas y grandes.',
                        brand: 'PetFood',
                        basePrice: 22000,
                        type: 'PHYSICAL',
                        characteristics: [{ key: 'Etapa de Vida', value: 'Adulto' }, { key: 'Peso', value: '15kg' }]
                    }
                ]
            },
            decoracion: {
                categories: [
                    { name: 'Mobiliario', slug: 'mobiliario' },
                    { name: 'Iluminación', slug: 'iluminacion' },
                    { name: 'Centros de Mesa', slug: 'centros-de-mesa' }
                ],
                products: [
                    {
                        name: 'Silla Tiffany (Demo Alquiler)',
                        description: 'Artículo de demostración para alquiler de eventos.',
                        brand: 'DecoEvent',
                        basePrice: 500,
                        type: 'PHYSICAL',
                        saleMode: 'ALQUILER',
                        characteristics: [{ key: 'Material', value: 'Policarbonato' }, { key: 'Color', value: 'Blanco' }]
                    }
                ]
            },
            ropa: {
                categories: [
                    { name: 'Remeras y Camisas', slug: 'remeras-y-camisas' },
                    { name: 'Pantalones', slug: 'pantalones' },
                    { name: 'Calzado', slug: 'calzado' }
                ],
                products: [
                    {
                        name: 'Remera Básica Algodón (Demo)',
                        description: 'Prenda de muestra. 100% algodón peinado.',
                        brand: 'Basics',
                        basePrice: 8500,
                        type: 'PHYSICAL',
                        characteristics: [{ key: 'Material', value: 'Algodón' }, { key: 'Género', value: 'Unisex' }]
                    }
                ]
            },
            general: {
                categories: [
                    { name: 'Electrónica', slug: 'electronica' },
                    { name: 'Hogar', slug: 'hogar' }
                ],
                products: [
                    {
                        name: 'Producto de Demostración',
                        description: 'Este es un producto generado automáticamente.',
                        brand: 'Genérica',
                        basePrice: 10000,
                        type: 'PHYSICAL',
                        characteristics: []
                    }
                ]
            }
        };

        const template = templates[rubro.slug] || templates.general;

        // 1. Crear categorías
        const createdCategories = [];
        for (const cat of template.categories) {
            const c = await prisma.category.create({
                data: {
                    tenantId,
                    name: cat.name,
                    slug: cat.slug,
                    description: `Categoría de ${cat.name}`
                }
            });
            createdCategories.push(c);
        }

        // 2. Crear productos
        if (createdCategories.length > 0) {
            for (const prod of template.products) {
                const product = await prisma.product.create({
                    data: {
                        tenantId,
                        name: prod.name,
                        description: prod.description,
                        brand: prod.brand,
                        basePrice: prod.basePrice,
                        type: prod.type,
                        isActive: true,
                        categoryId: createdCategories[0].id, // Asignar a la primera categoría
                        saleMode: prod.saleMode || 'VENTA',
                        characteristics: prod.characteristics,
                    }
                });

                // Crear SKU por defecto
                await prisma.sKU.create({
                    data: {
                        tenantId,
                        productId: product.id,
                        name: 'Default',
                        code: `${product.id}-DEFAULT`,
                        price: prod.basePrice,
                        stock: 100, // Stock ficticio de 100
                    }
                });
            }
        }
    }

  // ==================== PLANS ====================

  async getAllPlans() {
    return prisma.saaSPlan.findMany({
      include: { _count: { select: { tenants: true } } },
      orderBy: { monthlyPrice: 'asc' }
    });
  }

  async createPlan(data) {
    return prisma.saaSPlan.create({ data });
  }

  async updatePlan(id, data) {
    return prisma.saaSPlan.update({ where: { id }, data });
  }

  async deletePlan(id) {
    const tenantsUsingPlan = await prisma.tenant.count({ where: { planId: id } });
    if (tenantsUsingPlan > 0) {
      throw { statusCode: 400, message: `No se puede eliminar.${ tenantsUsingPlan } negocios usan este plan.` };
    }
    return prisma.saaSPlan.delete({ where: { id } });
  }

  // ==================== PAYMENTS ====================

  async registerPayment(data) {
    const tenant = await prisma.tenant.findUnique({ where: { id: data.tenantId } });
    if (!tenant) throw { statusCode: 404, message: 'Tenant no encontrado' };

    const payment = await prisma.tenantPayment.create({
      data: {
        tenantId: data.tenantId,
        amount: data.amount,
        period: data.period,
        method: data.method || null,
        reference: data.reference || null,
      }
    });

    // Extender la suscripción (1 mes desde ahora o desde la fecha de vencimiento actual)
    const currentEnd = tenant.subscriptionEnd ? new Date(tenant.subscriptionEnd) : new Date();
    const isSuspendedOrPaused = tenant.status === 'SUSPENDED' || tenant.status === 'PAUSED';
    const baseDate = (!isSuspendedOrPaused && currentEnd > new Date()) ? currentEnd : new Date();
    const newEnd = new Date(baseDate);
    newEnd.setMonth(newEnd.getMonth() + 1);

    const updateData = {
      subscriptionEnd: newEnd,
      lastPaymentDate: new Date(),
      status: 'ACTIVE',
      pauseReason: null
    };

    if (data.planId !== undefined && data.planId !== null) {
      updateData.planId = data.planId;
      if (data.monthlyPrice !== undefined && data.monthlyPrice !== null) updateData.monthlyPrice = data.monthlyPrice;
    } else if (tenant.pendingPlanId) {
      updateData.planId = tenant.pendingPlanId;
      const pendingPlan = await prisma.saaSPlan.findUnique({ where: { id: tenant.pendingPlanId } });
      if (pendingPlan) updateData.monthlyPrice = pendingPlan.monthlyPrice;
    }

    updateData.pendingPlanId = null;
    updateData.pendingPlanRequestedAt = null;

    await prisma.tenant.update({
      where: { id: data.tenantId },
      data: updateData
    });

    // Desactivar modo mantenimiento si estaba en pausa
    await prisma.storeConfig.updateMany({
      where: { tenantId: data.tenantId },
      data: { maintenanceMode: false }
    });

    invalidateTenantCache(data.tenantId);

    return payment;
  }

  async getPayments(filters = {}) {
    const where = {};
    if (filters.tenantId) where.tenantId = filters.tenantId;

    return prisma.tenantPayment.findMany({
      where,
      include: { tenant: { select: { name: true, slug: true } } },
      orderBy: { paidAt: 'desc' },
      take: filters.limit || 100
    });
  }

  // ==================== DASHBOARD ====================

  async getDashboardStats() {
    const [
      totalTenants,
      activeTenants,
      pausedTenants,
      suspendedTenants,
      totalPlans,
      recentPayments
    ] = await Promise.all([
      prisma.tenant.count(),
      prisma.tenant.count({ where: { status: 'ACTIVE' } }),
      prisma.tenant.count({ where: { status: 'PAUSED' } }),
      prisma.tenant.count({ where: { status: 'SUSPENDED' } }),
      prisma.saaSPlan.count({ where: { isActive: true } }),
      prisma.tenantPayment.findMany({
        orderBy: { paidAt: 'desc' },
        take: 10,
        include: { tenant: { select: { name: true } } }
      })
    ]);

    // MRR estimado
    const activeTenantsWithPrice = await prisma.tenant.findMany({
      where: { 
        status: 'ACTIVE', 
        monthlyPrice: { not: null },
        payments: { some: {} }
      },
      select: { monthlyPrice: true }
    });
    const mrr = activeTenantsWithPrice.reduce((sum, t) => sum + Number(t.monthlyPrice || 0), 0);

    // Próximos vencimientos (7 días)
    const sevenDays = new Date();
    sevenDays.setDate(sevenDays.getDate() + 7);
    const expiringSoon = await prisma.tenant.findMany({
      where: {
        status: 'ACTIVE',
        subscriptionEnd: { lte: sevenDays, gte: new Date() }
      },
      select: { id: true, name: true, subscriptionEnd: true, ownerName: true }
    });

    return {
      totalTenants,
      activeTenants,
      pausedTenants,
      suspendedTenants,
      totalPlans,
      mrr,
      expiringSoon,
      recentPayments
    };
  }

  // ==================== TENANT PLAN INFO (for admin panel) ====================

  async getTenantPlanInfo(tenantId) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { plan: true }
    });
    if (!tenant) return null;

    const productCount = await prisma.product.count({ where: { category: { tenantId } } });
    const branchCount = await prisma.branch.count({ where: { tenantId } });

    return {
      plan: tenant.plan,
      usage: {
        products: productCount,
        maxProducts: tenant.plan?.maxProducts || null,
        branches: branchCount,
        maxBranches: tenant.plan?.maxBranches || null,
      },
      enabledModules: tenant.enabledModules?.length > 0 ? tenant.enabledModules : (tenant.plan?.enabledModules || []),
      features: {
        allowCustomDomain: tenant.plan?.allowCustomDomain || false,
        allowInvoicing: tenant.plan?.allowInvoicing || false,
        allowPOS: tenant.plan?.allowPOS || false,
      },
      subscription: {
        start: tenant.subscriptionStart,
        end: tenant.subscriptionEnd,
        status: tenant.status,
      }
    };
  }
  // ==================== RUBROS ====================

  async getAllRubros() {
    return prisma.rubro.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
  }

  async updateTenantRubro(tenantId, rubroId) {
    // SEGURIDAD: El rubro es PERMANENTE una vez asignado al negocio.
    // Cambiar el rubro después de la inicialización causaría inconsistencias graves de datos
    // (categorías, productos, configuraciones son específicas por rubro).
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw { statusCode: 404, message: 'Tenant no encontrado' };

    if (tenant.rubroId) {
      throw {
        statusCode: 400,
        message: 'El rubro de este negocio no puede modificarse. Una vez asignado, el rubro es permanente para garantizar la integridad de los datos del negocio (categorías, productos, configuraciones, etc.).',
        code: 'RUBRO_IMMUTABLE'
      };
    }

    // Si no tiene rubro aún, se permite asignarlo por primera vez
    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: { rubroId: rubroId ? parseInt(rubroId) : null },
      include: { plan: true, rubro: true }
    });

    invalidateTenantCache(tenantId);
    return updated;
  }
}

module.exports = new SaaSService();
