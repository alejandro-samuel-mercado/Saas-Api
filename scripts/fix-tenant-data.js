/**
 * ==========================================================================
 * SCRIPT DE REPARACIÓN DE DATOS - Fix tenantId "default"
 * ==========================================================================
 * Migra todos los registros con tenantId="default" al tenant real.
 * Maneja conflictos de unique constraints:
 *   - Si el tenant real ya tiene el registro → elimina el duplicado "default"
 *   - Si no tiene conflicto → actualiza el tenantId
 *
 * Ejecutar: node scripts/fix-tenant-data.js
 * Aplicar:  DRY_RUN=false node scripts/fix-tenant-data.js
 * ==========================================================================
 */

require('dotenv').config();
const prisma = require('../src/config/prisma');

// ─── CONFIGURACIÓN ─────────────────────────────────────────────────────────
const DRY_RUN = process.env.DRY_RUN !== 'false';
const OLD_TENANT_ID = 'default';
const REAL_TENANT_ID = process.env.TARGET_TENANT_ID || '48758d33-947f-4724-afce-17e13f72730a';

// ─── Utilidades ─────────────────────────────────────────────────────────────
let totalUpdated = 0;
let totalDeleted = 0;

function log(msg) { console.log(msg); }

// Actualiza registros simples (sin conflicto de unique en tenantId)
async function simpleUpdate(model, modelName) {
  const count = await model.count({ where: { tenantId: OLD_TENANT_ID } });
  if (count === 0) {
    log(`  ⏭️  "${modelName}": sin registros con tenantId="${OLD_TENANT_ID}"`);
    return;
  }
  if (!DRY_RUN) {
    await model.updateMany({
      where: { tenantId: OLD_TENANT_ID },
      data: { tenantId: REAL_TENANT_ID }
    });
  }
  const mode = DRY_RUN ? '[DRY RUN] Actualizaría' : 'Actualizó';
  log(`  ✅ ${mode} ${count} registros en "${modelName}"`);
  totalUpdated += count;
}

// Para tablas donde tenantId es UNIQUE (StoreConfig, etc.)
// Si ya existe un registro del tenant real → elimina el de "default"
// Si no existe → actualiza el de "default"
async function uniqueTenantUpdate(model, modelName) {
  const defaultRecord = await model.findFirst({ where: { tenantId: OLD_TENANT_ID } });
  if (!defaultRecord) {
    log(`  ⏭️  "${modelName}": sin registros con tenantId="${OLD_TENANT_ID}"`);
    return;
  }
  const realRecord = await model.findFirst({ where: { tenantId: REAL_TENANT_ID } });
  if (realRecord) {
    // Ya existe → el de "default" es el duplicado, lo eliminamos
    if (!DRY_RUN) {
      await model.delete({ where: { id: defaultRecord.id } });
    }
    const mode = DRY_RUN ? '[DRY RUN] Eliminaría' : 'Eliminó';
    log(`  🗑️  ${mode} "${modelName}" duplicado (el tenant real ya tiene el suyo) → ID=${defaultRecord.id}`);
    totalDeleted++;
  } else {
    // No existe → actualizamos el tenantId
    if (!DRY_RUN) {
      await model.update({
        where: { id: defaultRecord.id },
        data: { tenantId: REAL_TENANT_ID }
      });
    }
    const mode = DRY_RUN ? '[DRY RUN] Actualizaría' : 'Actualizó';
    log(`  ✅ ${mode} "${modelName}" → ID=${defaultRecord.id}`);
    totalUpdated++;
  }
}

// Para tablas con composite unique que incluye tenantId + otro campo
// (Role: tenantId+name, User: tenantId+email, Branch: tenantId+code, etc.)
// Verifica conflictos por nombre/email/code antes de actualizar.
// IMPORTANTE: Para Role, reasigna los Users antes de eliminar para no violar FKs.
async function compositeUniqueUpdate(model, modelName, conflictField) {
  const defaultRecords = await model.findMany({ where: { tenantId: OLD_TENANT_ID } });
  if (defaultRecords.length === 0) {
    log(`  ⏭️  "${modelName}": sin registros con tenantId="${OLD_TENANT_ID}"`);
    return;
  }

  let updated = 0, deleted = 0;
  for (const rec of defaultRecords) {
    const conflictValue = rec[conflictField];
    const existing = await model.findFirst({
      where: { tenantId: REAL_TENANT_ID, [conflictField]: conflictValue }
    });

    if (existing) {
      // Conflicto: si es Role, reasignar primero los Users que apuntan a este rol
      if (modelName === 'Role') {
        const usersWithThisRole = await prisma.user.count({ where: { roleId: rec.id } });
        if (usersWithThisRole > 0) {
          if (!DRY_RUN) {
            await prisma.user.updateMany({
              where: { roleId: rec.id },
              data: { roleId: existing.id }
            });
          }
          log(`    → Reasignó ${usersWithThisRole} usuario(s) del Role "${conflictValue}" duplicado al del tenant real`);
        }
      }
      // Ahora sí eliminar el duplicado
      if (!DRY_RUN) {
        await model.delete({ where: { id: rec.id } });
      }
      deleted++;
    } else {
      if (!DRY_RUN) {
        await model.update({
          where: { id: rec.id },
          data: { tenantId: REAL_TENANT_ID }
        });
      }
      updated++;
    }
  }

  const modeU = DRY_RUN ? '[DRY RUN] Actualizaría' : 'Actualizó';
  const modeD = DRY_RUN ? '[DRY RUN] Eliminaría' : 'Eliminó';
  if (updated > 0) { log(`  ✅ ${modeU} ${updated} en "${modelName}"`); totalUpdated += updated; }
  if (deleted > 0) { log(`  🗑️  ${modeD} ${deleted} duplicados en "${modelName}"`); totalDeleted += deleted; }
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  log('\n' + '═'.repeat(65));
  log(`  SCRIPT DE REPARACIÓN DE TENANT DATA`);
  log('═'.repeat(65));
  log(`  Modo: ${DRY_RUN ? '🔍 DRY RUN (simulación)' : '🚨 APLICANDO CAMBIOS REALES'}`);
  log(`  Origen: tenantId="${OLD_TENANT_ID}" → Destino: "${REAL_TENANT_ID}"`);
  log('═'.repeat(65) + '\n');

  const targetTenant = await prisma.tenant.findUnique({ where: { id: REAL_TENANT_ID } });
  if (!targetTenant) {
    log(`❌ ERROR: Tenant "${REAL_TENANT_ID}" no existe.`);
    const all = await prisma.tenant.findMany({ select: { id: true, name: true } });
    all.forEach(t => log(`   - ${t.id} | ${t.name}`));
    process.exit(1);
  }
  log(`✅ Tenant destino: "${targetTenant.name}" (${targetTenant.status})\n`);

  log('--- Fase 1: Tablas con tenantId @unique ---');
  await uniqueTenantUpdate(prisma.storeConfig, 'StoreConfig');

  log('\n--- Fase 2: Tablas con unique compuesto (tenantId + otro campo) ---');
  await compositeUniqueUpdate(prisma.role, 'Role', 'name');
  await compositeUniqueUpdate(prisma.user, 'User', 'email');
  await compositeUniqueUpdate(prisma.branch, 'Branch', 'code');
  await compositeUniqueUpdate(prisma.currency, 'Currency', 'code');
  await compositeUniqueUpdate(prisma.paymentGateway, 'PaymentGateway', 'slug');
  await compositeUniqueUpdate(prisma.coupon, 'Coupon', 'code');
  await compositeUniqueUpdate(prisma.chatAutoResponse, 'ChatAutoResponse', 'trigger');
  await compositeUniqueUpdate(prisma.supplier, 'Supplier', 'taxId');

  log('\n--- Fase 3: Tablas de actualización simple ---');
  await simpleUpdate(prisma.category, 'Category');
  await simpleUpdate(prisma.product, 'Product');
  await simpleUpdate(prisma.sKU, 'SKU');
  await simpleUpdate(prisma.barcodeSequence, 'BarcodeSequence');
  await simpleUpdate(prisma.event, 'Event');
  await simpleUpdate(prisma.discount, 'Discount');
  await simpleUpdate(prisma.shippingZone, 'ShippingZone');
  await simpleUpdate(prisma.productPrice, 'ProductPrice');
  await simpleUpdate(prisma.gatewayCurrencySupport, 'GatewayCurrencySupport');
  await simpleUpdate(prisma.purchase, 'Purchase');
  await simpleUpdate(prisma.supplierPayment, 'SupplierPayment');
  await simpleUpdate(prisma.chatConversation, 'ChatConversation');
  await simpleUpdate(prisma.errorLog, 'ErrorLog');
  await simpleUpdate(prisma.blogPost, 'BlogPost');
  await simpleUpdate(prisma.expense, 'Expense');
  await simpleUpdate(prisma.auditLog, 'AuditLog');
  await simpleUpdate(prisma.sale, 'Sale');
  await simpleUpdate(prisma.saleReceipt, 'SaleReceipt');

  log('\n--- Fase 4: Sincronizar rubroId de Productos con el del Tenant ---');
  const { rubroId: tenantRubroId } = targetTenant;
  if (tenantRubroId) {
    const wrongRubroProducts = await prisma.product.count({
      where: { tenantId: REAL_TENANT_ID, rubroId: { not: tenantRubroId } }
    });
    if (wrongRubroProducts > 0) {
      if (!DRY_RUN) {
        await prisma.product.updateMany({
          where: { tenantId: REAL_TENANT_ID, rubroId: { not: tenantRubroId } },
          data: { rubroId: tenantRubroId }
        });
      }
      const mode = DRY_RUN ? '[DRY RUN] Actualizaría' : 'Actualizó';
      log(`  ✅ ${mode} ${wrongRubroProducts} productos al rubroId=${tenantRubroId}`);
      totalUpdated += wrongRubroProducts;
    } else {
      log(`  ⏭️  Todos los productos ya tienen el rubroId correcto (${tenantRubroId}).`);
    }
  } else {
    log(`  ⚠️  El tenant no tiene rubroId. Saltando.`);
  }

  log('\n--- Fase 5: Sincronizar tenantId de SKUs con su Producto padre ---');
  const skusToSync = await prisma.sKU.findMany({
    where: { tenantId: { not: REAL_TENANT_ID } },
    include: { product: { select: { tenantId: true } } }
  });
  const skusToFix = skusToSync.filter(s => s.product?.tenantId === REAL_TENANT_ID);
  if (skusToFix.length > 0) {
    if (!DRY_RUN) {
      await prisma.sKU.updateMany({
        where: { id: { in: skusToFix.map(s => s.id) } },
        data: { tenantId: REAL_TENANT_ID }
      });
    }
    const mode = DRY_RUN ? '[DRY RUN] Actualizaría' : 'Actualizó';
    log(`  ✅ ${mode} ${skusToFix.length} SKUs con tenantId incorrecto`);
    totalUpdated += skusToFix.length;
  } else {
    log(`  ⏭️  Todos los SKUs ya tienen tenantId sincronizado.`);
  }

  log('\n' + '═'.repeat(65));
  log(`  RESUMEN: ${totalUpdated} actualizados, ${totalDeleted} duplicados eliminados`);
  if (DRY_RUN) {
    log('\n  👆 SIMULACIÓN. Para aplicar:\n     DRY_RUN=false node scripts/fix-tenant-data.js');
  } else {
    log('\n  ✅ ¡COMPLETADO! Ejecutá las pruebas:\n     node tests/tenant-consistency.test.js');
  }
  log('═'.repeat(65) + '\n');
}

main()
  .catch(e => { console.error('Error:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
