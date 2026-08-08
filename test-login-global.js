const AuthService = require('./src/services/auth.service');
const prisma = require('./src/config/prisma');

async function test() {
  const email = 'barberia@gmail.com';
  const password = 'admin'; 
  
  console.log('Testing global login (no tenantId provided)');
  try {
      // simulating what happens when frontend does not send x-tenant-id
      // req.tenantId is undefined, so tenantContext is empty
      const user = await prisma.user.findFirst({
            where: { 
                email: email,
                role: { name: { in: ['SUPER_ADMIN', 'ADMIN', 'EMPLOYEE'] } }
            },
            include: { 
            role: true,
            adminBranches: true 
            }
      });
      console.log('User found by global search:', user ? user.email + ' (role: ' + user.role.name + ')' : 'NOT FOUND');
  } catch (e) {
      console.log('Error:', e.message);
  }
}

test().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
