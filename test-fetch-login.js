const http = require('http');
const app = require('./src/app');

const server = http.createServer(app);
server.listen(4000, async () => {
    try {
        console.log('Testing login with tenant default in headers (as frontend does)');
        const res = await fetch('http://localhost:4000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-tenant-id': 'default'
            },
            body: JSON.stringify({
                email: 'barberia@gmail.com',
                password: 'wrong_password_to_check_if_user_exists'
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
