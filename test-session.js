const http = require('http');
const app = require('./src/app');
const prisma = require('./src/config/prisma');
const bcrypt = require('bcryptjs');

const server = http.createServer(app);

server.listen(4001, async () => {
    try {
        console.log('1. Setting password to admin123 for barberia@gmail.com');
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('admin123', salt);
        await prisma.user.updateMany({
            where: { email: 'barberia@gmail.com' },
            data: { password: hash }
        });
        
        console.log('2. Logging in with global tenant (default)');
        const loginRes = await fetch('http://localhost:4001/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-tenant-id': 'default'
            },
            body: JSON.stringify({ email: 'barberia@gmail.com', password: 'admin123' })
        });
        const loginData = await loginRes.json();
        console.log('Login Status:', loginRes.status, loginData.success ? 'SUCCESS' : 'FAILED');
        
        if (!loginData.success) {
            console.log('Login failed:', loginData);
            return;
        }

        const token = loginData.data.tokens.accessToken;
        const tenantId = loginData.data.user.tenantId;
        console.log('Token received. User tenantId:', tenantId);

        console.log('3. Hitting /api/config with token and x-tenant-id =', tenantId);
        const configRes = await fetch('http://localhost:4001/api/config', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'x-tenant-id': tenantId
            }
        });
        const configData = await configRes.json();
        console.log('Config Status:', configRes.status, configData);

    } catch (e) {
        console.error(e);
    } finally {
        server.close();
        process.exit(0);
    }
});
