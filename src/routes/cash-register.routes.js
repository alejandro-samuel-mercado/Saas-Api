const express = require('express');
const router = express.Router();
const CashRegisterController = require('../controllers/cash-register.controller');
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');

// All cash register routes require authentication
router.use(auth);

// Cash Register Management
router.post('/registers', checkRole(['SUPER_ADMIN', 'ADMIN']), CashRegisterController.createRegister);
router.get('/registers', checkRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE']), CashRegisterController.getRegisters);

// Cash Session Management (Apertura / Cierre de Caja)
router.post('/sessions', checkRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE']), CashRegisterController.openSession);
router.put('/sessions/:sessionId/close', checkRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER']), CashRegisterController.closeSession);
router.get('/registers/:registerId/session', checkRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE']), CashRegisterController.getActiveSession);
router.get('/sessions/:sessionId', checkRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE']), CashRegisterController.getSessionDetails);

// Cash Movements (Ingreso / Egreso)
router.post('/movements', checkRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER']), CashRegisterController.addMovement);

module.exports = router;
