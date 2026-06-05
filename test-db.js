const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const tenant = await prisma.tenant.findFirst();
  console.log('Active tenant:', tenant.id, tenant.name, tenant.rubroId);
  const products = await prisma.product.count({ where: { tenantId: tenant.id } });
  console.log('Products count:', products);
  const cats = await prisma.category.count({ where: { tenantId: tenant.id } });
  console.log('Categories count:', cats);
  const pList = await prisma.product.findMany({ where: { tenantId: tenant.id }, select: { name: true, category: { select: { name: true }} }, take: 5 });
  console.log(pList);
}
main().catch(console.error).finally(() => prisma.$disconnect());
