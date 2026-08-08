const prisma = require('./src/config/prisma');
const tenantContext = require('./src/utils/async-context');

async function test() {
    const email = 'consumidor.final@local.pos';
    const tenantId = '80e365de-9330-4957-b512-b17e036a5961';
    
    tenantContext.run(tenantId, async () => {
        try {
            console.log('1. Checking findFirst...');
            const existing = await prisma.user.findFirst({ where: { email }});
            console.log('existing:', existing);
            
            console.log('2. Attempting create...');
            const customerRole = await prisma.role.findFirst({ where: { name: 'CUSTOMER' } });
            
            const newUser = await prisma.user.create({
                data: {
                    email,
                    name: 'CONSUMIDOR FINAL',
                    password: 'hash',
                    roleId: customerRole.id
                }
            });
            console.log('Created!', newUser.id);
            
        } catch (e) {
            console.error('Error:', e);
        } finally {
            process.exit(0);
        }
    });
}
test();
