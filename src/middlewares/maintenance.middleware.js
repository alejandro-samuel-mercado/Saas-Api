const prisma = require('../config/prisma');

/**
 * Middleware para verificar si la tienda está en modo mantenimiento.
 * Ahora es tenant-aware: busca el StoreConfig del tenant específico.
 */
const configCache = new Map();
const CACHE_TTL = 5000;

const checkMaintenanceMode = async (req, res, next) => {
    try {
        const tenantId = req.tenantId;
        if (!tenantId) return next();

        const cacheKey = `maintenance_${tenantId}`;
        const now = Date.now();
        const cached = configCache.get(cacheKey);

        let config;
        if (cached && (now - cached.fetchedAt) < CACHE_TTL) {
            config = cached.data;
        } else {
            config = await prisma.storeConfig.findFirst({ where: { tenantId } });
            configCache.set(cacheKey, { data: config, fetchedAt: now });
        }

        if (config && config.maintenanceMode) {
            return res.status(503).json({
                success: false,
                message: 'La tienda se encuentra en mantenimiento. Por favor intente más tarde.',
                maintenance: true
            });
        }

        next();
    } catch (error) {
        console.error('[MaintenanceMiddleware] Error checking config:', error.message);
        next();
    }
};

module.exports = checkMaintenanceMode;
