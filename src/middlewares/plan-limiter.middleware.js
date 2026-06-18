const prisma = require('../config/prisma');

/**
 * Verifica que el tenant no haya superado el límite de productos de su plan.
 */
const checkProductLimit = async (req, res, next) => {
  try {
    if (!req.tenant?.plan) return next();

    const maxProducts = req.tenant.plan.maxProducts;
    if (!maxProducts || maxProducts <= 0) return next(); // sin límite

    // Prisma ya inyecta tenantId automáticamente desde el contexto del request.
    // Solo filtramos productos no eliminados del tenant activo.
    const count = await prisma.product.count({
      where: { isDeleted: false }
    });

    if (count >= maxProducts) {
      console.warn(`[PlanLimiter] Tenant "${req.tenant.name}" alcanzó el límite de productos: ${count}/${maxProducts}`);
      return res.status(403).json({
        success: false,
        message: `Su plan "${req.tenant.plan.name}" permite hasta ${maxProducts} productos. Actualice su plan para agregar más.`,
        code: 'PLAN_LIMIT_PRODUCTS',
        usage: { current: count, max: maxProducts }
      });
    }

    next();
  } catch (error) {
    console.error('[PlanLimiter] Error checking product limit:', error.message);
    next();
  }
};

/**
 * Verifica que el tenant no haya superado el límite de sucursales.
 */
const checkBranchLimit = async (req, res, next) => {
  try {
    if (!req.tenant?.plan) return next();

    const maxBranches = req.tenant.plan.maxBranches;
    if (!maxBranches || maxBranches <= 0) return next();

    // tenantId auto-inyectado por Prisma desde el contexto del request.
    const count = await prisma.branch.count({
      where: { isActive: true }
    });

    if (count >= maxBranches) {
      console.warn(`[PlanLimiter] Tenant "${req.tenant.name}" alcanzó el límite de sucursales: ${count}/${maxBranches}`);
      return res.status(403).json({
        success: false,
        message: `Su plan "${req.tenant.plan.name}" permite hasta ${maxBranches} sucursales. Actualice su plan para agregar más.`,
        code: 'PLAN_LIMIT_BRANCHES',
        usage: { current: count, max: maxBranches }
      });
    }

    next();
  } catch (error) {
    console.error('[PlanLimiter] Error checking branch limit:', error.message);
    next();
  }
};

/**
 * Factory: verifica que un módulo esté habilitado en el plan del tenant.
 * Uso: checkModuleAccess('suppliers')
 */
const checkModuleAccess = (moduleName) => {
  return (req, res, next) => {
    if (!req.tenant?.plan) return next();

    const enabledModules = req.tenant.enabledModules?.length > 0 
      ? req.tenant.enabledModules 
      : (req.tenant.plan?.enabledModules || []);

    if (!enabledModules.includes(moduleName)) {
      return res.status(403).json({
        success: false,
        message: `El módulo "${moduleName}" no está disponible en su plan "${req.tenant.plan.name}". Actualice su plan para acceder.`,
        code: 'PLAN_MODULE_DISABLED'
      });
    }

    next();
  };
};

module.exports = { checkProductLimit, checkBranchLimit, checkModuleAccess };
