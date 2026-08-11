const express = require('express');
const router = express.Router();
const CashRegisterController = require('../controllers/cash-register.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

// All cash register routes require authentication
router.use(protect);

// Cash Register Management
router.post('/registers', restrictTo(['SUPER_ADMIN', 'ADMIN']), CashRegisterController.createRegister);
router.get('/registers', restrictTo(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE']), CashRegisterController.getRegisters);

// Cash Session Management (Apertura / Cierre de Caja)
router.post('/sessions', restrictTo(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE']), CashRegisterController.openSession);
router.put('/sessions/:sessionId/close', restrictTo(['SUPER_ADMIN', 'ADMIN', 'MANAGER']), CashRegisterController.closeSession);
router.get('/registers/:registerId/session', restrictTo(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE']), CashRegisterController.getActiveSession);
router.get('/sessions/:sessionId', restrictTo(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE']), CashRegisterController.getSessionDetails);

// Cash Movements (Ingreso / Egreso)
router.post('/movements', restrictTo(['SUPER_ADMIN', 'ADMIN', 'MANAGER']), CashRegisterController.addMovement);

module.exports = router;
