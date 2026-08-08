const prisma = require('./src/config/prisma');

async function test() {
  const users = await prisma.user.findMany({
      include: { role: true }
  });
  
  for (const user of users) {
      if (user.role && user.role.name === 'SUPER_ADMIN') {
          console.log(`Email: ${user.email}, Status: ${user.status}, Tenant: ${user.tenantId}`);
      }
  }
}

test().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
