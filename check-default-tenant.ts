import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.findUnique({
    where: { id: 'default' },
    include: { rubro: true }
  });
  console.log('Default tenant rubro:', tenant?.rubro?.slug);
  const count = await prisma.product.count({ where: { tenantId: 'default' } });
  console.log('Default tenant products:', count);
}
main().catch(console.error).finally(() => prisma.$disconnect());
