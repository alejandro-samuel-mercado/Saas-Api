const request = require('supertest');
const app = require('./src/app');

async function run() {
    console.log('Testing login with tenant barberia in headers');
    let res = await request(app)
        .post('/api/auth/login')
        .set('x-tenant-id', 'barberia')
        .send({
            email: 'barberia@gmail.com',
            password: 'admin' // Should give incorrect password
        });
    console.log('With x-tenant-id = barberia:', res.status, res.body);

    console.log('\nTesting global login (no headers)');
    let res2 = await request(app)
        .post('/api/auth/login')
        .send({
            email: 'barberia@gmail.com',
            password: 'admin'
        });
    console.log('Without x-tenant-id:', res2.status, res2.body);
    
    console.log('\nTesting login with tenant default in headers');
    let res3 = await request(app)
        .post('/api/auth/login')
        .set('x-tenant-id', 'default')
        .send({
            email: 'barberia@gmail.com',
            password: 'admin'
        });
    console.log('With x-tenant-id = default:', res3.status, res3.body);
    
    // Maybe try the saas login?
    console.log('\nTesting saas login');
    let res4 = await request(app)
        .post('/api/saas/auth/login')
        .send({
            email: 'barberia@gmail.com',
            password: 'admin'
        });
    console.log('SAAS login:', res4.status, res4.body);
    
    process.exit(0);
}

run().catch(console.error);
