const CashRegisterService = require('../services/cash-register.service');

class CashRegisterController {
    // -----------------------------------------------------
    // Cash Register
    // -----------------------------------------------------
    async createRegister(req, res) {
        try {
            const data = { ...req.body, tenantId: req.user.tenantId };
            const register = await CashRegisterService.createRegister(data);
            res.status(201).json({ success: true, data: register });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getRegisters(req, res) {
        try {
            const { branchId } = req.query;
            if (!branchId) return res.status(400).json({ success: false, message: 'branchId is required' });
            
            const registers = await CashRegisterService.getRegistersByBranch(branchId, req.user.tenantId);
            res.json({ success: true, data: registers });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    // -----------------------------------------------------
    // Sessions (Turnos de Caja)
    // -----------------------------------------------------
    async openSession(req, res) {
        try {
            const data = { 
                ...req.body, 
                userId: req.user.id, 
                tenantId: req.user.tenantId 
            };
            const session = await CashRegisterService.openSession(data);
            res.status(201).json({ success: true, data: session });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async closeSession(req, res) {
        try {
            const { sessionId } = req.params;
            const { actualBalances, differencesJson, notes } = req.body;
            
            const session = await CashRegisterService.closeSession(
                sessionId, 
                actualBalances, 
                differencesJson, 
                notes,
                req.user.tenantId
            );
            res.json({ success: true, data: session });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getActiveSession(req, res) {
        try {
            const { registerId } = req.params;
            const session = await CashRegisterService.getActiveSession(registerId, req.user.tenantId);
            if (!session) return res.status(404).json({ success: false, message: 'No active session' });
            res.json({ success: true, data: session });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getSessionDetails(req, res) {
        try {
            const { sessionId } = req.params;
            const session = await CashRegisterService.getSessionDetails(sessionId, req.user.tenantId);
            if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
            res.json({ success: true, data: session });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    // -----------------------------------------------------
    // Movements (Ingresos / Egresos)
    // -----------------------------------------------------
    async addMovement(req, res) {
        try {
            const data = { 
                ...req.body, 
                userId: req.user.id, 
                tenantId: req.user.tenantId 
            };
            const movement = await CashRegisterService.addMovement(data);
            res.status(201).json({ success: true, data: movement });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}

module.exports = new CashRegisterController();
