const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const logs = await prisma.systemLog.findMany({ orderBy: { createdAt: 'desc' }, take: 2 });
  console.log(logs);
}
main().finally(() => prisma.$disconnect());
