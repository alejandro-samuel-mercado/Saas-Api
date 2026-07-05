require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ 
  connectionString,
  max: 5, 
  min: 0, 
  idleTimeoutMillis: 30000, // Cerrar conexiones inactivas más rápido
  connectionTimeoutMillis: 30000, // Incrementado para arranque en frío de Neon serverless 
  query_timeout: 30000, // Timeout de consulta 30s
  statement_timeout: 30000, // Timeout de sentencia 30s
  allowExitOnIdle: true, // Permitir salir del proceso cuando el pool está inactivo
  ssl: { rejectUnauthorized: false } 
});

pool.on('connect', () => {
});

pool.on('remove', () => {
});

const adapter = new PrismaPg(pool);

const tenantContext = require('../utils/async-context');

const basePrisma = new PrismaClient({ 
  adapter,
  log: [
    { level: 'warn', emit: 'event' },
    { level: 'error', emit: 'event' }
  ]
});

basePrisma.$on('warn', (e) => {
  console.warn('  [Prisma]', e.message);
});

basePrisma.$on('error', (e) => {
});

// Modelos que NO pertenecen a un negocio específico o son de administración global
const excludeModels = [
  'Tenant', 'SaaSPlan', 'TenantPayment', 'Rubro', 'VariantOption', 
  'Permission', 'Cart', 'CartItem', 'Notification', 'RefreshToken', 
  'PointsHistory', 'Comment', 'SaleItem', 'PaymentTransaction', 
  'StockReservation', 'AccessLog', 'Transfer', 'BranchInventory', 
  'UserBranch', 'StockTransfer', 'StockTransferItem', 'SupplierSKU', 
  'PurchaseItem', 'StockMovement', 'ChatMessage'
];

const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const tenantId = tenantContext.getStore();

        if (tenantId && !excludeModels.includes(model)) {
          // Operaciones de lectura y agregación múltiple
          if (['findMany', 'findFirst', 'count', 'aggregate', 'groupBy'].includes(operation)) {
            args.where = { ...args.where, tenantId };
          }
          // Operaciones de creación
          else if (operation === 'create') {
            args.data = { ...args.data, tenantId };
          }
          else if (operation === 'createMany') {
            if (Array.isArray(args.data)) {
              args.data = args.data.map(item => ({ ...item, tenantId }));
            } else {
              args.data = { ...args.data, tenantId };
            }
          }
          // Operaciones de actualización masiva
          else if (['updateMany', 'deleteMany'].includes(operation)) {
            args.where = { ...args.where, tenantId };
          }
          // Intercepción de operaciones únicas
          else if (operation === 'findUnique') {
             args.where = { ...args.where, tenantId };
             const modelCamel = model.charAt(0).toLowerCase() + model.slice(1);
             return basePrisma[modelCamel].findFirst(args);
          }
          else if (['update', 'delete'].includes(operation)) {
             const modelCamel = model.charAt(0).toLowerCase() + model.slice(1);
             const record = await basePrisma[modelCamel].findFirst({
                 where: { ...args.where, tenantId }
             });
             if (!record) {
                 throw new Error(`Acceso denegado o registro no encontrado en ${model}`);
             }
             // Si el registro pertenece al tenant, procedemos con la operación original
          }
        }
        
        return query(args);
      }
    }
  }
});

module.exports = prisma;
