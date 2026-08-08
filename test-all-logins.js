const http = require('http');
const app = require('./src/app');
const prisma = require('./src/config/prisma');

const server = http.createServer(app);

server.listen(4000, async () => {
    try {
        console.log('Fetching all tenants to test global login for each ownerEmail...');
        const tenants = await prisma.tenant.findMany();
        
        let notFoundCount = 0;
        let foundCount = 0;

        for (const t of tenants) {
            const email = t.ownerEmail;
            if (!email) continue;
            
            const res = await fetch('http://localhost:4000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-id': 'default'
                },
                body: JSON.stringify({
                    email: email,
                    password: 'wrong_password'
                })
            });
            const data = await res.json();
            
            if (data.message === 'El usuario ingresado no existe.') {
                console.log(`❌ [NOT FOUND] Email: ${email} (Tenant: ${t.slug})`);
                notFoundCount++;
            } else if (data.message === 'La contraseña es incorrecta.') {
                console.log(`✅ [FOUND] Email: ${email} (Tenant: ${t.slug})`);
                foundCount++;
            } else {
                console.log(`⚠️ [OTHER ERROR] Email: ${email} - ${data.message}`);
            }
        }
        
        console.log(`\nSummary: ${foundCount} found, ${notFoundCount} not found.`);

    } catch (e) {
        console.error(e);
    } finally {
        server.close();
        process.exit(0);
    }
});
