const AuthController = require('./src/controllers/auth.controller');

async function test() {
  const req = {
    body: {
      email: 'barberia@gmail.com',
      password: 'admin' // wrong password, let's see if we get "no existe" or "incorrecta"
    },
    // simulating no x-tenant-id
  };

  const res = {
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      console.log('Response JSON:', this.statusCode, data);
    }
  };

  const next = function(err) {
    console.log('Next called with error:', err.message);
  };

  await AuthController.login(req, res, next);
}

test().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
