import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const rubro = await prisma.rubro.findUnique({ where: { slug: 'decoracion' } });
  if (!rubro) throw new Error("Rubro decoracion not found");

  const tenant = await prisma.tenant.findFirst({
    where: { rubroId: rubro.id }
  });
  
  if (!tenant) throw new Error("Decor tenant not found");

  const products = await prisma.product.findMany({
    where: { tenantId: tenant.id }
  });
  console.log(`Found ${products.length} products for tenant ${tenant.id}`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
