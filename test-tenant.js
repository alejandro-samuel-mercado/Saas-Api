const tenantMiddleware = require('./src/middlewares/tenant.middleware');
tenantMiddleware.getCachedTenant('48758d33-947f-4724-afce-17e13f72730a').then(t => console.log("TENANT RUBRO ID:", t.rubroId)).finally(()=>process.exit(0));
