const AuthService = require('./src/services/auth.service');
const prisma = require('./src/config/prisma');
const tenantContext = require('./src/utils/async-context');

async function test() {
  const email = 'barberia@gmail.com';
  const password = 'admin'; // We don't know the exact password, but let's check what error we get.
  
  // get tenantId
  const tenant = await prisma.tenant.findUnique({ where: { slug: 'barberia' } });
  
  console.log('Testing login with UUID tenantId:', tenant.id);
  try {
      await tenantContext.run(tenant.id, async () => {
          await AuthService.login(email, password, tenant.id);
      });
      console.log('Login success');
  } catch (e) {
      console.log('Error logging in:', e.message);
      if (e.message.includes('contraseña')) {
         console.log('It found the user, just password was wrong!');
      }
  }
}

test().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
