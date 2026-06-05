import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const rubro = await prisma.rubro.findUnique({ where: { slug: 'decoracion' } });
  const tenant = await prisma.tenant.findFirst({ where: { rubroId: rubro?.id } });
  const count = await prisma.product.count({ where: { tenantId: tenant?.id } });
  console.log('Decor tenant product count:', count);
}
main().catch(console.error).finally(() => prisma.$disconnect());
