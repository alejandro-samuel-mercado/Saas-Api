const express = require('express');
const router = express.Router();
const saasController = require('../controllers/saas.controller');
const { authenticateSaasOwner } = require('../middlewares/saas-auth.middleware');

// Auth (sin protección)
router.post('/auth/login', saasController.login);

// Todas las demás rutas requieren autenticación del SaaS owner
router.use(authenticateSaasOwner);

// Dashboard
router.get('/dashboard', saasController.getDashboard);

// Customers
router.get('/customers', saasController.getAllCustomers);
router.get('/customers/:email', saasController.getCustomer);

// Tenants
router.get('/tenants', saasController.getAllTenants);
router.post('/tenants', saasController.createTenant);
router.get('/tenants/:id', saasController.getTenant);
router.put('/tenants/:id', saasController.updateTenant);
router.post('/tenants/:id/pause', saasController.pauseTenant);
router.post('/tenants/:id/resume', saasController.resumeTenant);
router.delete('/tenants/:id', saasController.deleteTenant);

// Plans
router.get('/plans', saasController.getPlans);
router.post('/plans', saasController.createPlan);
router.put('/plans/:id', saasController.updatePlan);
router.delete('/plans/:id', saasController.deletePlan);

// Payments
router.get('/payments', saasController.getPayments);
router.post('/payments', saasController.registerPayment);

// Rubros
router.get('/rubros', saasController.getRubros);
router.patch('/tenants/:id/rubro', saasController.updateTenantRubro);

module.exports = router;
