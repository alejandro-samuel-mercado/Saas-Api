const cron = require('node-cron');
const prisma = require('../config/prisma');
const { invalidateTenantCache } = require('../middlewares/tenant.middleware');

/**
 * Cron job diario (a las 3:00 AM) que:
 * 1. Busca tenants con suscripción vencida y status ACTIVE
 * 2. Los pausa automáticamente
 * 3. Activa modo mantenimiento en su StoreConfig
 */
function initializeSubscriptionCron() {
  // Ejecutar todos los días a las 3:00 AM
  cron.schedule('0 3 * * *', async () => {
    console.log('[SubscriptionCron] Verificando suscripciones vencidas...');
    try {
      const expiredTenants = await prisma.tenant.findMany({
        where: {
          status: 'ACTIVE',
          subscriptionEnd: { lt: new Date() }
        }
      });

      if (expiredTenants.length === 0) {
        console.log('[SubscriptionCron] No hay suscripciones vencidas.');
        return;
      }

      console.log(`[SubscriptionCron] ${expiredTenants.length} suscripciones vencidas encontradas.`);

      for (const tenant of expiredTenants) {
        await prisma.tenant.update({
          where: { id: tenant.id },
          data: { status: 'PAUSED', pauseReason: 'payment_overdue' }
        });

        const tenantContext = require('../utils/async-context');
        await tenantContext.run(tenant.id, async () => {
          await prisma.storeConfig.updateMany({
            where: { tenantId: tenant.id },
            data: { maintenanceMode: true }
          });
        });

        invalidateTenantCache(tenant.id);
        console.log(`[SubscriptionCron] Tenant "${tenant.name}" (${tenant.id}) pausado por falta de pago.`);
      }
    } catch (error) {
      console.error('[SubscriptionCron] Error:', error.message);
    }
  });

  console.log('[SubscriptionCron] Cron de suscripciones inicializado (diario 3:00 AM).');
}

module.exports = { initializeSubscriptionCron };
