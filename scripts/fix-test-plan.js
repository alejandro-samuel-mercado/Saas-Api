/**
 * Actualiza el plan del tenant de prueba para reflejar
 * la cantidad real de productos/sucursales de seed.
 * Ejecutar: node scripts/fix-test-plan.js
 */
require('dotenv').config();
const prisma = require('../src/config/prisma');

async function main() {
  // Buscar el plan básico
  const plan = await prisma.saaSPlan.findFirst({ where: { name: 'Plan básico' } });
  if (!plan) {
    console.log('❌ Plan "Plan básico" no encontrado.');
    return;
  }

  const tenant = await prisma.tenant.findFirst({});
  if (!tenant) {
    console.log('❌ No hay tenants.');
    return;
  }

  const productCount = await prisma.product.count({ where: { tenantId: tenant.id, isDeleted: false } });
  const branchCount = await prisma.branch.count({ where: { tenantId: tenant.id, isActive: true } });

  // Actualizar el plan básico para que refleje capacidad real de producción (más generosa)
  await prisma.saaSPlan.update({
    where: { id: plan.id },
    data: {
      maxProducts: Math.max(plan.maxProducts, productCount + 20), // deja margen de 20 más
      maxBranches: Math.max(plan.maxBranches, branchCount)
    }
  });

  console.log(`✅ Plan "${plan.name}" actualizado:`);
  console.log(`   maxProducts: ${plan.maxProducts} → ${Math.max(plan.maxProducts, productCount + 20)}`);
  console.log(`   maxBranches: ${plan.maxBranches} → ${Math.max(plan.maxBranches, branchCount)}`);
  console.log(`\n   Tenant "${tenant.name}": ${productCount} productos, ${branchCount} sucursales`);
}

main()
  .catch(e => { console.error(e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
