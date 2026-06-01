/**
 * tenant-helpers.js
 * Helpers centralizados para obtener configuración de tienda y monedas
 * respetando siempre el tenant activo en el contexto de la solicitud.
 */
const prisma = require('../config/prisma');
const tenantContext = require('./async-context');

/**
 * Retorna el tenantId del contexto actual o 'default'.
 */
function getTenantId() {
  return tenantContext.getStore() || 'default';
}

/**
 * Obtiene la configuración de la tienda del tenant activo.
 * Reemplaza todos los usos de: prisma.storeConfig.findFirst({ where: { id: 1 } })
 */
async function getStoreConfig() {
  const tenantId = getTenantId();
  return await prisma.storeConfig.findFirst({ where: { tenantId } });
}

/**
 * Obtiene una moneda por código del tenant activo.
 * Reemplaza todos los usos de: prisma.currency.findUnique({ where: { code } })
 * @param {string} code - Código de moneda (ej: 'USD', 'ARS')
 */
async function getCurrencyByCode(code) {
  const tenantId = getTenantId();
  return await prisma.currency.findFirst({
    where: { tenantId, code: code.toUpperCase() },
  });
}

module.exports = { getTenantId, getStoreConfig, getCurrencyByCode };
