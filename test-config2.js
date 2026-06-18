const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tenants = await prisma.tenant.findMany({
    include: { config: true, rubro: true }
  });
  console.log(JSON.stringify(tenants.map(t => ({ id: t.id, name: t.name, rubro: t.rubro?.slug, themeColors: t.config?.themeColors })), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
