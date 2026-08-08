const http = require('http');
const app = require('./src/app');

const server = http.createServer(app);
server.listen(4001, async () => {
    try {
        console.log('Testing successful login with tenant default in headers');
        const res = await fetch('http://localhost:4001/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-tenant-id': 'default'
            },
            body: JSON.stringify({
                email: 'barberia@gmail.com',
                password: 'admin123'
            })
        });
        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Response:', data);
    } catch (e) {
        console.error(e);
    } finally {
        server.close();
        process.exit(0);
    }
});
