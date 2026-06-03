const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); // Native client without pg-adapter

async function main() {
  const tenant = await prisma.tenant.findUnique({ where: { slug: 'slickstyle' } });
  if (tenant) {
    console.log("Deleting tenant slickstyle...");
    await prisma.globalConfig.deleteMany({ where: { tenantId: tenant.id } });
    await prisma.storeConfig.deleteMany({ where: { tenantId: tenant.id } });
    await prisma.tenant.delete({ where: { slug: 'slickstyle' } });
    console.log("Deleted!");
  } else {
    console.log("Tenant slickstyle not found.");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
