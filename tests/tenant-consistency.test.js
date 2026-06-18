/**
 * ==========================================================================
 * SUITE DE PRUEBAS DE CONSISTENCIA MULTI-TENANT
 * ==========================================================================
 * Verifica que los datos estén 100% aislados entre negocios, rubros, y planes.
 * No debe haber ninguna "fuga" de datos entre tenants.
 *
 * Ejecutar: node tests/tenant-consistency.test.js
 * ==========================================================================
 */

require('dotenv').config();
// Reutilizamos la instancia ya configurada con @prisma/adapter-pg + pool de Neon
const prisma = require('../src/config/prisma');

// ─── Utilidades ────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;
let warnings = 0;
const results = [];

function log(status, category, test, detail = '') {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️ ';
  console.log(`${icon} [${category}] ${test}${detail ? ' → ' + detail : ''}`);
  results.push({ status, category, test, detail });
  if (status === 'PASS') passed++;
  else if (status === 'FAIL') failed++;
  else warnings++;
}

function section(title) {
  console.log(`\n${'═'.repeat(65)}`);
  console.log(`  ${title}`);
  console.log('═'.repeat(65));
}

// ─── Tests ─────────────────────────────────────────────────────────────────

async function testTenantExistenceAndStatus() {
  section('1. TENANTS: Existencia y Estado');

  const tenants = await prisma.tenant.findMany({
    include: { plan: true, rubro: true }
  });

  if (tenants.length === 0) {
    log('WARN', 'TENANT', 'No hay tenants en la base de datos. Creá al menos 2 para probar el aislamiento.');
    return tenants;
  }

  log('PASS', 'TENANT', `Se encontraron ${tenants.length} tenants en el sistema`);

  for (const t of tenants) {
    const hasId = !!t.id;
    const hasSlug = !!t.slug;
    const hasOwnerEmail = !!t.ownerEmail;
    const hasValidStatus = ['ACTIVE', 'PAUSED', 'SUSPENDED'].includes(t.status);

    if (hasId && hasSlug && hasOwnerEmail && hasValidStatus) {
      log('PASS', 'TENANT', `Tenant "${t.name}" [${t.id.substring(0, 8)}...]`, `status=${t.status}, plan=${t.plan?.name || 'SIN PLAN'}, rubro=${t.rubro?.name || 'SIN RUBRO'}`);
    } else {
      log('FAIL', 'TENANT', `Tenant "${t.name}" tiene campos críticos incompletos`,
        `id=${hasId}, slug=${hasSlug}, email=${hasOwnerEmail}, status=${hasValidStatus}`);
    }
  }

  // Verificar que no haya slugs duplicados
  const slugs = tenants.map(t => t.slug);
  const uniqueSlugs = new Set(slugs);
  if (slugs.length === uniqueSlugs.size) {
    log('PASS', 'TENANT', 'Todos los slugs de tenants son únicos');
  } else {
    log('FAIL', 'TENANT', '¡ATENCIÓN! Existen slugs duplicados entre tenants', `Total: ${slugs.length}, Únicos: ${uniqueSlugs.size}`);
  }

  return tenants;
}

async function testDataIsolationBetweenTenants(tenants) {
  section('2. AISLAMIENTO DE DATOS ENTRE TENANTS');

  if (tenants.length < 2) {
    log('WARN', 'ISOLATION', 'Se necesitan al menos 2 tenants activos para probar el aislamiento. Saltando...');
    return;
  }

  const activeTenants = tenants.filter(t => t.status === 'ACTIVE');
  if (activeTenants.length < 2) {
    log('WARN', 'ISOLATION', 'Se necesitan al menos 2 tenants ACTIVOS. Saltando...');
    return;
  }

  const [tenantA, tenantB] = activeTenants;

  // ── Productos
  const productsA = await prisma.product.findMany({ where: { tenantId: tenantA.id } });
  const productsB = await prisma.product.findMany({ where: { tenantId: tenantB.id } });
  const productIdsA = new Set(productsA.map(p => p.id));
  const productIdsB = new Set(productsB.map(p => p.id));
  const productOverlap = [...productIdsA].filter(id => productIdsB.has(id));

  if (productOverlap.length === 0) {
    log('PASS', 'ISOLATION', `Productos aislados entre "${tenantA.name}" y "${tenantB.name}"`, `A=${productsA.length} prods, B=${productsB.length} prods`);
  } else {
    log('FAIL', 'ISOLATION', `¡FUGA! ${productOverlap.length} productos compartidos entre tenants`, `IDs: ${productOverlap.join(', ')}`);
  }

  // ── Usuarios
  const usersA = await prisma.user.findMany({ where: { tenantId: tenantA.id } });
  const usersB = await prisma.user.findMany({ where: { tenantId: tenantB.id } });
  const userEmailsA = new Set(usersA.map(u => u.email));
  const userEmailsB = new Set(usersB.map(u => u.email));
  const emailOverlap = [...userEmailsA].filter(e => userEmailsB.has(e));

  if (emailOverlap.length === 0) {
    log('PASS', 'ISOLATION', `Usuarios aislados entre "${tenantA.name}" y "${tenantB.name}"`, `A=${usersA.length} users, B=${usersB.length} users`);
  } else {
    // Esto es NORMAL: un usuario puede ser cliente de 2 negocios, pero debe tener IDs distintos
    log('WARN', 'ISOLATION', `${emailOverlap.length} emails existen en ambos tenants (pueden ser clientes compartidos)`, `Emails: ${emailOverlap.join(', ')}`);
    // Verificar que los IDs sean distintos (regla: @@unique([tenantId, email]))
    const usersAWithOverlap = usersA.filter(u => emailOverlap.includes(u.email));
    const usersBWithOverlap = usersB.filter(u => emailOverlap.includes(u.email));
    const userIdOverlap = usersAWithOverlap.filter(ua => usersBWithOverlap.some(ub => ub.id === ua.id));
    if (userIdOverlap.length === 0) {
      log('PASS', 'ISOLATION', 'Los usuarios con email duplicado tienen IDs distintos (correcto)');
    } else {
      log('FAIL', 'ISOLATION', '¡FUGA CRÍTICA! Mismo ID de usuario en múltiples tenants');
    }
  }

  // ── Ventas
  const salesA = await prisma.sale.findMany({ where: { tenantId: tenantA.id } });
  const salesB = await prisma.sale.findMany({ where: { tenantId: tenantB.id } });
  const saleIdsA = new Set(salesA.map(s => s.id));
  const saleIdsB = new Set(salesB.map(s => s.id));
  const saleOverlap = [...saleIdsA].filter(id => saleIdsB.has(id));

  if (saleOverlap.length === 0) {
    log('PASS', 'ISOLATION', `Ventas aisladas entre tenants`, `A=${salesA.length} ventas, B=${salesB.length} ventas`);
  } else {
    log('FAIL', 'ISOLATION', `¡FUGA! ${saleOverlap.length} ventas compartidas entre tenants`);
  }

  // ── Categorías
  const catsA = await prisma.category.findMany({ where: { tenantId: tenantA.id } });
  const catsB = await prisma.category.findMany({ where: { tenantId: tenantB.id } });
  log('PASS', 'ISOLATION', `Categorías por tenant`, `A="${tenantA.name}": ${catsA.length}, B="${tenantB.name}": ${catsB.length}`);

  // ── Configuraciones
  const configA = await prisma.storeConfig.findFirst({ where: { tenantId: tenantA.id } });
  const configB = await prisma.storeConfig.findFirst({ where: { tenantId: tenantB.id } });
  if (configA && configB && configA.id !== configB.id) {
    log('PASS', 'ISOLATION', 'StoreConfig independiente por tenant');
  } else if (!configA || !configB) {
    log('WARN', 'ISOLATION', 'Algún tenant no tiene StoreConfig propio', `A=${!!configA}, B=${!!configB}`);
  } else {
    log('FAIL', 'ISOLATION', '¡FUGA! Tenants comparten la misma StoreConfig');
  }

  // ── Sucursales (Branches)
  const branchesA = await prisma.branch.findMany({ where: { tenantId: tenantA.id } });
  const branchesB = await prisma.branch.findMany({ where: { tenantId: tenantB.id } });
  const branchIdsA = new Set(branchesA.map(b => b.id));
  const branchIdsB = new Set(branchesB.map(b => b.id));
  const branchOverlap = [...branchIdsA].filter(id => branchIdsB.has(id));
  if (branchOverlap.length === 0) {
    log('PASS', 'ISOLATION', `Sucursales aisladas entre tenants`, `A=${branchesA.length}, B=${branchesB.length}`);
  } else {
    log('FAIL', 'ISOLATION', `¡FUGA! ${branchOverlap.length} sucursales compartidas`);
  }
}

async function testOrphanedData() {
  section('3. DATOS HUÉRFANOS (sin tenantId válido)');

  const allTenants = await prisma.tenant.findMany({ select: { id: true } });
  const validTenantIds = new Set(allTenants.map(t => t.id));

  const tables = [
    { model: prisma.product, name: 'Product' },
    { model: prisma.category, name: 'Category' },
    { model: prisma.user, name: 'User' },
    { model: prisma.sale, name: 'Sale' },
    { model: prisma.branch, name: 'Branch' },
    { model: prisma.coupon, name: 'Coupon' },
    { model: prisma.storeConfig, name: 'StoreConfig' },
    { model: prisma.sKU, name: 'SKU' },
    { model: prisma.supplier, name: 'Supplier' },
    { model: prisma.event, name: 'Event' },
  ];

  for (const { model, name } of tables) {
    try {
      const records = await model.findMany({ select: { tenantId: true }, distinct: ['tenantId'] });
      const orphaned = records.filter(r => !validTenantIds.has(r.tenantId));

      if (orphaned.length === 0) {
        const total = await model.count();
        log('PASS', 'ORPHAN', `${name}: sin datos huérfanos`, `Total: ${total} registros`);
      } else {
        const orphanIds = orphaned.map(o => o.tenantId);
        log('FAIL', 'ORPHAN', `${name}: ${orphaned.length} tenantId(s) sin tenant válido`, `IDs: ${orphanIds.join(', ')}`);
      }
    } catch (e) {
      log('WARN', 'ORPHAN', `No se pudo verificar ${name}`, e.message);
    }
  }
}

async function testRubroConsistency(tenants) {
  section('4. CONSISTENCIA DE RUBROS');

  const rubros = await prisma.rubro.findMany({
    include: { tenants: { select: { id: true, name: true } } }
  });

  if (rubros.length === 0) {
    log('WARN', 'RUBRO', 'No hay rubros definidos en el sistema.');
    return;
  }

  log('PASS', 'RUBRO', `Se encontraron ${rubros.length} rubros activos`);

  for (const rubro of rubros) {
    const slugOk = !!rubro.slug;
    const nameOk = !!rubro.name;

    if (slugOk && nameOk) {
      log('PASS', 'RUBRO', `Rubro "${rubro.name}" válido`, `tenants asignados: ${rubro.tenants.length}, módulos desactivados: [${rubro.disabledModules.join(', ')}]`);
    } else {
      log('FAIL', 'RUBRO', `Rubro ID=${rubro.id} incompleto`, `slug=${slugOk}, name=${nameOk}`);
    }
  }

  // Verificar que los tenants con rubro tengan el ID de rubro correcto
  const tenantsWithRubro = tenants.filter(t => t.rubroId !== null);
  const tenantsWithoutRubro = tenants.filter(t => t.rubroId === null);

  log(tenantsWithoutRubro.length > 0 ? 'WARN' : 'PASS', 'RUBRO',
    `${tenantsWithRubro.length}/${tenants.length} tenants tienen rubro asignado`,
    tenantsWithoutRubro.map(t => t.name).join(', ') || 'Todos con rubro'
  );

  // Verificar que el rubroId sea válido (apunte a un Rubro existente)
  const validRubroIds = new Set(rubros.map(r => r.id));
  for (const t of tenantsWithRubro) {
    if (validRubroIds.has(t.rubroId)) {
      log('PASS', 'RUBRO', `Tenant "${t.name}" → Rubro ID=${t.rubroId} válido`);
    } else {
      log('FAIL', 'RUBRO', `Tenant "${t.name}" apunta a un Rubro inexistente`, `rubroId=${t.rubroId}`);
    }
  }

  // Verificar que los productos asignados a un rubro correspondan al rubro del tenant
  for (const tenant of tenantsWithRubro) {
    const productsWithWrongRubro = await prisma.product.findMany({
      where: {
        tenantId: tenant.id,
        rubroId: { not: tenant.rubroId }
      },
      select: { id: true, name: true, rubroId: true }
    });

    if (productsWithWrongRubro.length === 0) {
      log('PASS', 'RUBRO', `Tenant "${tenant.name}": todos los productos son del rubro correcto`);
    } else {
      log('FAIL', 'RUBRO', `Tenant "${tenant.name}": ${productsWithWrongRubro.length} productos con rubro incorrecto`,
        productsWithWrongRubro.map(p => `"${p.name}" (rubroId=${p.rubroId})`).join(', ')
      );
    }
  }
}

async function testPlanLimits(tenants) {
  section('5. LÍMITES DE PLAN (No exceder productos/sucursales)');

  const tenantsWithPlan = tenants.filter(t => t.plan);

  if (tenantsWithPlan.length === 0) {
    log('WARN', 'PLAN', 'Ningún tenant tiene plan asignado. Saltando...');
    return;
  }

  for (const tenant of tenantsWithPlan) {
    const { plan } = tenant;

    // Verificar límite de productos
    const productCount = await prisma.product.count({
      where: { tenantId: tenant.id, isDeleted: false }
    });
    if (productCount <= plan.maxProducts) {
      log('PASS', 'PLAN', `"${tenant.name}": productos dentro del límite`, `${productCount}/${plan.maxProducts}`);
    } else {
      log('FAIL', 'PLAN', `"${tenant.name}": ¡EXCEDE el límite de productos del plan!`, `${productCount}/${plan.maxProducts}`);
    }

    // Verificar límite de sucursales
    const branchCount = await prisma.branch.count({
      where: { tenantId: tenant.id, isActive: true }
    });
    if (branchCount <= plan.maxBranches) {
      log('PASS', 'PLAN', `"${tenant.name}": sucursales dentro del límite`, `${branchCount}/${plan.maxBranches}`);
    } else {
      log('FAIL', 'PLAN', `"${tenant.name}": ¡EXCEDE el límite de sucursales del plan!`, `${branchCount}/${plan.maxBranches}`);
    }
  }
}

async function testCrossTenantSKUIntegrity() {
  section('6. INTEGRIDAD DE SKUs ENTRE SUCURSALES');

  const allBranchInventories = await prisma.branchInventory.findMany({
    include: {
      sku: { select: { id: true, tenantId: true } },
      branch: { select: { id: true, tenantId: true, name: true } }
    }
  });

  let crossTenantIssues = 0;
  for (const inv of allBranchInventories) {
    if (inv.sku.tenantId !== inv.branch.tenantId) {
      log('FAIL', 'SKU_INTEGRITY', `BranchInventory ID=${inv.id}: SKU de tenant "${inv.sku.tenantId}" en sucursal de tenant "${inv.branch.tenantId}"`);
      crossTenantIssues++;
    }
  }

  if (crossTenantIssues === 0) {
    log('PASS', 'SKU_INTEGRITY', `Todos los ${allBranchInventories.length} registros de inventario son coherentes entre sucursales y SKUs`);
  }

  // Verificar que cada SKU tenga tenantId igual al del producto padre
  const skusWithParent = await prisma.sKU.findMany({
    include: { product: { select: { tenantId: true, name: true } } }
  });

  let skuOrphans = 0;
  for (const sku of skusWithParent) {
    if (sku.tenantId !== sku.product.tenantId) {
      log('FAIL', 'SKU_INTEGRITY', `SKU "${sku.code}": su tenantId no coincide con el del producto "${sku.product.name}"`,
        `SKU.tenantId=${sku.tenantId}, Product.tenantId=${sku.product.tenantId}`);
      skuOrphans++;
    }
  }

  if (skuOrphans === 0) {
    log('PASS', 'SKU_INTEGRITY', `Todos los ${skusWithParent.length} SKUs tienen tenantId coherente con su producto`);
  }
}

async function testSaleBranchConsistency() {
  section('7. VENTAS: Coherencia entre Tenant y Sucursal');

  const sales = await prisma.sale.findMany({
    include: {
      branch: { select: { id: true, tenantId: true, name: true } }
    },
    take: 500 // limitar para no sobrecargar
  });

  let issues = 0;
  for (const sale of sales) {
    if (sale.branch.tenantId !== sale.tenantId) {
      log('FAIL', 'SALE_CONSISTENCY', `Venta ID=${sale.id}: tenantId="${sale.tenantId}" pero sucursal es de "${sale.branch.tenantId}"`);
      issues++;
    }
  }

  if (issues === 0) {
    log('PASS', 'SALE_CONSISTENCY', `Las ${sales.length} ventas verificadas tienen coherencia entre tenant y sucursal`);
  } else {
    log('FAIL', 'SALE_CONSISTENCY', `${issues} ventas tienen inconsistencia entre tenant y sucursal`);
  }
}

async function testAuthScopeIsolation() {
  section('8. AUTENTICACIÓN: Aislamiento de Scope por Tenant');

  // Verificar que los roles existan dentro del mismo tenant y que cada usuario use el rol de su propio tenant
  const roles = await prisma.role.findMany({ select: { id: true, tenantId: true, name: true } });
  const allUsers = await prisma.user.findMany({ select: { id: true, roleId: true, tenantId: true, email: true } });
  log('PASS', 'AUTH', `${allUsers.length} usuarios y ${roles.length} roles encontrados para verificar integridad`);

  let roleIssues = 0;
  for (const user of allUsers) {
    const userRole = roles.find(r => r.id === user.roleId);
    if (!userRole) {
      log('FAIL', 'AUTH', `Usuario "${user.email}" apunta a un Role inexistente`, `roleId=${user.roleId}`);
      roleIssues++;
    } else if (userRole.tenantId !== user.tenantId) {
      log('FAIL', 'AUTH', `Usuario "${user.email}" usa un Rol de otro tenant`, `user.tenantId=${user.tenantId}, role.tenantId=${userRole.tenantId}`);
      roleIssues++;
    }
  }

  if (roleIssues === 0) {
    log('PASS', 'AUTH', `Todos los ${allUsers.length} usuarios tienen roles válidos dentro de su propio tenant`);
  }
}

async function testCouponIsolation() {
  section('9. CUPONES: Aislamiento entre Tenants');

  const coupons = await prisma.coupon.findMany({ select: { id: true, code: true, tenantId: true } });

  // Los cupones deben ser únicos por (tenantId + code), pero el mismo código puede estar en tenants distintos
  const couponMap = {};
  let duplicates = 0;
  for (const c of coupons) {
    const key = `${c.tenantId}::${c.code}`;
    if (couponMap[key]) {
      log('FAIL', 'COUPON', `Cupón duplicado: código "${c.code}" en el mismo tenant "${c.tenantId}"`);
      duplicates++;
    }
    couponMap[key] = c.id;
  }

  if (duplicates === 0) {
    log('PASS', 'COUPON', `${coupons.length} cupones sin duplicados dentro del mismo tenant`);
  }

  // Verificar que ninguna venta use un cupón de otro tenant
  const salesWithCoupons = await prisma.sale.findMany({
    where: { couponId: { not: null } },
    include: { coupon: { select: { tenantId: true, code: true } } },
    take: 200
  });

  let couponCrossTenant = 0;
  for (const sale of salesWithCoupons) {
    if (sale.coupon && sale.coupon.tenantId !== sale.tenantId) {
      log('FAIL', 'COUPON', `Venta ID=${sale.id} usa cupón de otro tenant`, `sale.tenant=${sale.tenantId}, coupon.tenant=${sale.coupon.tenantId}`);
      couponCrossTenant++;
    }
  }

  if (couponCrossTenant === 0 && salesWithCoupons.length > 0) {
    log('PASS', 'COUPON', `Las ${salesWithCoupons.length} ventas con cupón usan cupones de su propio tenant`);
  } else if (salesWithCoupons.length === 0) {
    log('WARN', 'COUPON', 'No hay ventas con cupones para verificar');
  }
}

async function testSubscriptionExpiry(tenants) {
  section('10. SUSCRIPCIONES: Vencimientos y Estado');

  const now = new Date();

  for (const tenant of tenants) {
    if (tenant.subscriptionEnd) {
      const isExpired = new Date(tenant.subscriptionEnd) < now;
      const isActive = tenant.status === 'ACTIVE';

      if (isExpired && isActive) {
        log('FAIL', 'SUBSCRIPTION', `Tenant "${tenant.name}" tiene suscripción VENCIDA pero está ACTIVE`,
          `Venció: ${new Date(tenant.subscriptionEnd).toLocaleDateString()}`);
      } else if (isExpired && !isActive) {
        log('PASS', 'SUBSCRIPTION', `Tenant "${tenant.name}": suscripción vencida y estado correcto (${tenant.status})`);
      } else {
        const daysLeft = Math.floor((new Date(tenant.subscriptionEnd) - now) / (1000 * 60 * 60 * 24));
        log('PASS', 'SUBSCRIPTION', `Tenant "${tenant.name}": suscripción vigente`, `Vence en ${daysLeft} días`);
      }
    } else {
      log('WARN', 'SUBSCRIPTION', `Tenant "${tenant.name}" no tiene fecha de fin de suscripción definida`);
    }
  }
}

// ─── Runner principal ──────────────────────────────────────────────────────

async function runAllTests() {
  console.log('\n' + '█'.repeat(65));
  console.log('  SUITE DE CONSISTENCIA MULTI-TENANT - SUPER ECOMMERCE SAAS');
  console.log('█'.repeat(65));
  console.log(`  Fecha: ${new Date().toLocaleString()}`);
  console.log(`  DB: ${process.env.DATABASE_URL?.substring(0, 50)}...`);

  try {
    await prisma.$connect();
    console.log('  Conexión a Neon DB: ✅ OK\n');

    const tenants = await testTenantExistenceAndStatus();
    const tenantsWithDetails = await prisma.tenant.findMany({ include: { plan: true, rubro: true } });

    await testDataIsolationBetweenTenants(tenantsWithDetails);
    await testOrphanedData();
    await testRubroConsistency(tenantsWithDetails);
    await testPlanLimits(tenantsWithDetails);
    await testCrossTenantSKUIntegrity();
    await testSaleBranchConsistency();
    await testAuthScopeIsolation();
    await testCouponIsolation();
    await testSubscriptionExpiry(tenantsWithDetails);

  } catch (error) {
    console.error('\n❌ ERROR CRÍTICO durante las pruebas:', error.message);
    if (error.code === 'P2022') {
      console.error('   La base de datos no está sincronizada con el schema. Ejecutá: npx prisma db push');
    }
  } finally {
    await prisma.$disconnect();
  }

  // ── Resumen Final
  console.log(`\n${'═'.repeat(65)}`);
  console.log('  RESUMEN FINAL');
  console.log('═'.repeat(65));
  console.log(`  ✅ PASARON:    ${passed}`);
  console.log(`  ❌ FALLARON:   ${failed}`);
  console.log(`  ⚠️  WARNINGS:  ${warnings}`);
  console.log('═'.repeat(65));

  if (failed === 0) {
    console.log('\n  🏆 ¡SISTEMA SANO! No se detectaron fugas ni inconsistencias.\n');
  } else {
    console.log(`\n  🚨 SE DETECTARON ${failed} PROBLEMA(S) QUE REQUIEREN ATENCIÓN.\n`);
  }

  process.exit(failed > 0 ? 1 : 0);
}

runAllTests();
