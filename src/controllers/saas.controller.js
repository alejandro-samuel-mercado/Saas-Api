const SaaSService = require('../services/saas.service');
const jwt = require('jsonwebtoken');

const SAAS_SECRET = process.env.SAAS_JWT_SECRET || process.env.JWT_SECRET || 'saas_fallback_secret';
const SAAS_EMAIL = process.env.SAAS_OWNER_EMAIL || 'admin@saas.com';
const SAAS_PASSWORD = process.env.SAAS_OWNER_PASSWORD || 'saas_admin_123';

const saasController = {
  // ==================== AUTH ====================
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (email !== SAAS_EMAIL || password !== SAAS_PASSWORD) {
        return res.status(401).json({ success: false, message: 'Credenciales inválidas.' });
      }
      const token = jwt.sign({ email, role: 'SAAS_OWNER' }, SAAS_SECRET, { expiresIn: '24h' });
      res.json({ success: true, data: { token, user: { email, role: 'SAAS_OWNER' } } });
    } catch (error) { next(error); }
  },

  // ==================== DASHBOARD ====================
  getDashboard: async (req, res, next) => {
    try {
      const stats = await SaaSService.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (error) { next(error); }
  },

  // ==================== CUSTOMERS ====================
  getAllCustomers: async (req, res, next) => {
    try {
      const customers = await SaaSService.getAllCustomers();
      res.json({ success: true, data: customers });
    } catch (error) { next(error); }
  },

  getCustomer: async (req, res, next) => {
    try {
      const customer = await SaaSService.getCustomerByEmail(req.params.email);
      res.json({ success: true, data: customer });
    } catch (error) { next(error); }
  },

  // ==================== TENANTS ====================
  getAllTenants: async (req, res, next) => {
    try {
      const { status, search } = req.query;
      const result = await SaaSService.getAllTenants({ status, search });
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  getTenant: async (req, res, next) => {
    try {
      const tenant = await SaaSService.getTenantById(req.params.id);
      res.json({ success: true, data: tenant });
    } catch (error) { next(error); }
  },

  createTenant: async (req, res, next) => {
    try {
      const tenant = await SaaSService.createTenant(req.body);
      res.status(201).json({ success: true, data: tenant, message: 'Negocio creado e inicializado correctamente.' });
    } catch (error) { next(error); }
  },

  updateTenant: async (req, res, next) => {
    try {
      const tenant = await SaaSService.updateTenant(req.params.id, req.body);
      res.json({ success: true, data: tenant, message: 'Negocio actualizado.' });
    } catch (error) { next(error); }
  },

  pauseTenant: async (req, res, next) => {
    try {
      const reason = req.body.reason || 'manual';
      const tenant = await SaaSService.pauseTenant(req.params.id, reason);
      res.json({ success: true, data: tenant, message: 'Negocio pausado.' });
    } catch (error) { next(error); }
  },

  resumeTenant: async (req, res, next) => {
    try {
      const tenant = await SaaSService.resumeTenant(req.params.id);
      res.json({ success: true, data: tenant, message: 'Negocio reactivado.' });
    } catch (error) { next(error); }
  },

  deleteTenant: async (req, res, next) => {
    try {
      await SaaSService.deleteTenant(req.params.id);
      res.json({ success: true, message: 'Negocio suspendido.' });
    } catch (error) { next(error); }
  },

  // ==================== PLANS ====================
  getPlans: async (req, res, next) => {
    try {
      const plans = await SaaSService.getAllPlans();
      res.json({ success: true, data: plans });
    } catch (error) { next(error); }
  },

  createPlan: async (req, res, next) => {
    try {
      const plan = await SaaSService.createPlan(req.body);
      res.status(201).json({ success: true, data: plan, message: 'Plan creado.' });
    } catch (error) { next(error); }
  },

  updatePlan: async (req, res, next) => {
    try {
      const plan = await SaaSService.updatePlan(parseInt(req.params.id), req.body);
      res.json({ success: true, data: plan, message: 'Plan actualizado.' });
    } catch (error) { next(error); }
  },

  deletePlan: async (req, res, next) => {
    try {
      await SaaSService.deletePlan(parseInt(req.params.id));
      res.json({ success: true, message: 'Plan eliminado.' });
    } catch (error) { next(error); }
  },

  // ==================== PAYMENTS ====================
  registerPayment: async (req, res, next) => {
    try {
      const payment = await SaaSService.registerPayment(req.body);
      res.status(201).json({ success: true, data: payment, message: 'Pago registrado. Suscripción extendida.' });
    } catch (error) { next(error); }
  },

  getPayments: async (req, res, next) => {
    try {
      const { tenantId, limit } = req.query;
      const payments = await SaaSService.getPayments({ tenantId, limit: parseInt(limit) || 100 });
      res.json({ success: true, data: payments });
    } catch (error) { next(error); }
  },

  // ==================== TENANT PLAN INFO (for admin/client panels) ====================
  getTenantPlanInfo: async (req, res, next) => {
    try {
      const tenantId = req.tenantId || req.params.id;
      const info = await SaaSService.getTenantPlanInfo(tenantId);
      res.json({ success: true, data: info });
    } catch (error) { next(error); }
  },

  // ==================== RUBROS ====================
  getRubros: async (req, res, next) => {
    try {
      const rubros = await SaaSService.getAllRubros();
      res.json({ success: true, data: rubros });
    } catch (error) { next(error); }
  },

  updateTenantRubro: async (req, res, next) => {
    try {
      const { rubroId } = req.body;
      const tenant = await SaaSService.updateTenantRubro(req.params.id, rubroId);
      res.json({ success: true, data: tenant, message: 'Rubro del negocio actualizado.' });
    } catch (error) { next(error); }
  }
};

module.exports = saasController;
