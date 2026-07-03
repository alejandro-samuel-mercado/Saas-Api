const prisma = require('../config/prisma');
const tenantContext = require('../utils/async-context');
// Cache de tenants para no consultar la DB en cada request
const tenantCache = new Map();
const CACHE_TTL = 30000; // 30 segundos

async function getCachedTenant(tenantId) {
    const cached = tenantCache.get(tenantId);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
        return cached.data;
    }

    // Busca por ID (si es un UUID) o por slug
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(tenantId);
    
    let tenant = null;
    if (isUuid) {
        tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            include: { plan: true, rubro: true }
        });
    } else {
        tenant = await prisma.tenant.findUnique({
            where: { slug: tenantId },
            include: { plan: true, rubro: true }
        });
    }

    if (tenant) {
        // Guardamos en caché usando la key provista (que podría ser el slug)
        tenantCache.set(tenantId, { data: tenant, fetchedAt: Date.now() });
        // También guardamos por el ID real para evitar misses futuros
        tenantCache.set(tenant.id, { data: tenant, fetchedAt: Date.now() });
    }
    return tenant;
}

// Invalidar cache de un tenant específico
function invalidateTenantCache(tenantId) {
    tenantCache.delete(tenantId);
}

/**
 * Middleware global que extrae y valida el tenant de cada request.
 * - Extrae x-tenant-id del header
 * - Verifica que el tenant exista y esté ACTIVE
 * - Auto-pausa si la suscripción venció
 * - Inyecta req.tenantId y req.tenant
 */
const extractTenant = async (req, res, next) => {
    try {
        let tenantId = req.headers['x-tenant-id'] || req.query.tenantId;

        if (!tenantId && req.query.state) {
            try {
                const stateObj = JSON.parse(req.query.state);
                if (stateObj.tenantId) tenantId = stateObj.tenantId;
            } catch (e) {}
        }

        if (!tenantId) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere el identificador del negocio (x-tenant-id o query tenantId).'
            });
        }

        let tenant;
        if (tenantId === 'default') {
            tenant = { id: 'default', slug: 'default', name: 'Master SaaS', status: 'ACTIVE' };
        } else {
            tenant = await getCachedTenant(tenantId);
        }

        if (!tenant) {
            return res.status(404).json({
                success: false,
                message: 'Negocio no encontrado.'
            });
        }

        // Auto-pausar si la suscripción venció
        if (tenant.subscriptionEnd && new Date() > new Date(tenant.subscriptionEnd) && tenant.status === 'ACTIVE') {
            await prisma.tenant.update({
                where: { id: tenantId },
                data: { status: 'PAUSED', pauseReason: 'payment_overdue' }
            });
            tenant.status = 'PAUSED';
            tenant.pauseReason = 'payment_overdue';
            invalidateTenantCache(tenantId);
        }

        // Si el tenant no está activo, retornar 503 (mantenimiento)
        if (tenant.status !== 'ACTIVE') {
            return res.status(503).json({
                success: false,
                message: 'La tienda se encuentra en pausa. Contacte al administrador.',
                maintenance: true,
                reason: tenant.pauseReason || 'paused'
            });
        }

        // Siempre inyectar el ID real (UUID) para que el resto del sistema consulte correctamente
        req.tenantId = tenant.id;
        req.tenant = tenant;

        tenantContext.run(tenant.id, () => {
            next();
        });
    } catch (error) {
        console.error('[TenantMiddleware] Error:', error.message);
        next();
    }
};

/**
 * Middleware que permite requests SIN tenant (para rutas del SaaS owner)
 * pero SI hay tenant en el header, lo valida
 */
const optionalTenant = async (req, res, next) => {
    const tenantId = req.headers['x-tenant-id'] || req.query.tenantId;
    if (tenantId && tenantId !== 'default') {
        return extractTenant(req, res, next);
    }
    // Si es default o no viene, pasamos sin inyectar req.tenantId
    next();
};

module.exports = { extractTenant, optionalTenant, invalidateTenantCache, getCachedTenant };
