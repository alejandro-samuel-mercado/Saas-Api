import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: { tenant: { rubro: { slug: 'decoracion' } } }
  });
  console.log(products.map(p => ({ id: p.id, name: p.name })));
}
main().catch(console.error).finally(() => prisma.$disconnect());
