import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const store = await prisma.store.findFirst({
    where: { rubro: { slug: 'decoracion' } },
    include: { rubro: true }
  });
  console.log("Store:", store);
}
main().catch(console.error).finally(() => prisma.$disconnect());
