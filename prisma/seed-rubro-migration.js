require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🔄 Iniciando migración de Rubros en Productos...');

  const tenants = await prisma.tenant.findMany({
    select: { id: true, rubroId: true, name: true }
  });

  let totalUpdated = 0;

  for (const tenant of tenants) {
    if (!tenant.rubroId) {
      console.log(`⚠️ Tenant "${tenant.name}" no tiene rubroId, omitiendo...`);
      continue;
    }

    const result = await prisma.product.updateMany({
      where: { tenantId: tenant.id, rubroId: null },
      data: { rubroId: tenant.rubroId }
    });

    console.log(`✅ Tenant "${tenant.name}": Actualizados ${result.count} productos al rubro ${tenant.rubroId}`);
    totalUpdated += result.count;
  }

  console.log(`🎉 Migración finalizada. Total productos actualizados: ${totalUpdated}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
