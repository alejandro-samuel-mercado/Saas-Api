const prisma = require('./src/config/prisma');
const tenantContext = require('./src/utils/async-context');

async function test() {
    const email = 'test_p2002@gmail.com';
    const tenantId = 'default'; // I'll use default to see if it reproduces
    
    tenantContext.run(tenantId, async () => {
        try {
            console.log('1. Checking findFirst...');
            const existing = await prisma.user.findFirst({ where: { email }});
            console.log('existing:', existing);
            
            console.log('2. Attempting create...');
            const newUser = await prisma.user.create({
                data: {
                    email,
                    name: 'Test',
                    password: 'hash',
                    roleId: 1
                }
            });
            console.log('Created!', newUser.id);
            
            console.log('3. Deleting...');
            await prisma.user.delete({ where: { id: newUser.id }});
        } catch (e) {
            console.error('Error:', e);
        }
    });
}
test();
