import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tenants = await prisma.tenant.findMany({ include: { rubro: true } });
  console.log("All tenants:");
  for (const t of tenants) {
    const pCount = await prisma.product.count({ where: { tenantId: t.id } });
    console.log(`Tenant ${t.id} - Rubro: ${t.rubro?.slug} - Products: ${pCount}`);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
