const prisma = require('./src/config/prisma.js');
async function run() {
  const users = await prisma.user.findMany({
    where: { tenantId: '48758d33-947f-4724-afce-17e13f72730a' },
    select: { id: true, email: true, roleId: true }
  });
  console.log('USERS:', users);
  const tenant = await prisma.tenant.findUnique({
    where: { id: '48758d33-947f-4724-afce-17e13f72730a' },
    select: { ownerEmail: true, name: true }
  });
  console.log('TENANT:', tenant);
}
run().catch(console.error).finally(() => process.exit(0));
