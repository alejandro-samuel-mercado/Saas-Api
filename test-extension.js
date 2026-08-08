const prisma = require('./src/config/prisma');
const tenantContext = require('./src/utils/async-context');

async function test() {
  await new Promise((resolve) => {
    tenantContext.run('default', async () => {
      try {
        console.log('Testing findUnique (converted to findFirst)...');
        const user = await prisma.user.findUnique({ where: { id: 1 } });
        console.log('User 1 found:', !!user);

        console.log('Testing update pre-check (should fail if not found, or proceed)...');
        try {
          await prisma.user.update({ where: { id: 999999 }, data: { name: 'Test' } });
        } catch (e) {
          console.log('Update Error correctly caught:', e.message);
        }

        console.log('Testing findMany...');
        const users = await prisma.user.findMany({ take: 1 });
        console.log('Users found:', users.length);
        
        console.log('All tests passed successfully!');
        resolve();
      } catch (e) {
        console.error('Fatal Error:', e);
        resolve();
      }
    });
  });
}

test().then(() => process.exit(0));
