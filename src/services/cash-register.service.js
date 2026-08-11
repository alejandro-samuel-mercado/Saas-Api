const prisma = require('../config/prisma');

class CashRegisterService {
    // -----------------------------------------------------
    // Cash Register Management
    // -----------------------------------------------------
    async createRegister(data) {
        return await prisma.cashRegister.create({
            data: {
                name: data.name,
                branchId: data.branchId,
                tenantId: data.tenantId || "default"
            }
        });
    }

    async getRegistersByBranch(branchId, tenantId = "default") {
        return await prisma.cashRegister.findMany({
            where: { branchId: parseInt(branchId), tenantId, isActive: true }
        });
    }

    // -----------------------------------------------------
    // Cash Session Management (Apertura / Cierre de Caja)
    // -----------------------------------------------------
    async openSession(data) {
        // Check if there is already an open session for this register
        const activeSession = await prisma.cashSession.findFirst({
            where: {
                registerId: data.registerId,
                status: 'OPEN',
                tenantId: data.tenantId || "default"
            }
        });

        if (activeSession) {
            throw new Error('Ya existe un turno de caja abierto en esta caja.');
        }

        return await prisma.cashSession.create({
            data: {
                registerId: data.registerId,
                userId: data.userId,
                openingBalance: data.openingBalance || 0,
                status: 'OPEN',
                tenantId: data.tenantId || "default"
            }
        });
    }

    async getActiveSession(registerId, tenantId = "default") {
        return await prisma.cashSession.findFirst({
            where: {
                registerId: parseInt(registerId),
                status: 'OPEN',
                tenantId
            },
            include: {
                user: { select: { name: true, email: true } },
                movements: true
            }
        });
    }

    async getSessionDetails(sessionId, tenantId = "default") {
        return await prisma.cashSession.findFirst({
            where: { id: parseInt(sessionId), tenantId },
            include: {
                movements: true,
                sales: {
                    include: {
                        paymentTransactions: true
                    }
                }
            }
        });
    }

    async closeSession(sessionId, actualBalances, differencesJson, notes, tenantId = "default") {
        const session = await this.getSessionDetails(sessionId, tenantId);
        if (!session) throw new Error('Turno de caja no encontrado.');
        if (session.status === 'CLOSED') throw new Error('El turno de caja ya está cerrado.');

        // Calculate expected cash balance
        let expectedCashBalance = Number(session.openingBalance);

        // Add sales in cash
        for (const sale of session.sales) {
            if (sale.status !== 'CANCELLED') {
                for (const tx of sale.paymentTransactions) {
                    if (tx.method === 'CASH') {
                        expectedCashBalance += Number(tx.amount);
                    }
                }
                // Handle legacy sales without transactions if needed
                if (sale.paymentTransactions.length === 0 && sale.paymentType === 'CASH') {
                    expectedCashBalance += Number(sale.total);
                }
            }
        }

        // Add/Subtract movements
        for (const movement of session.movements) {
            if (movement.type === 'IN') {
                expectedCashBalance += Number(movement.amount);
            } else if (movement.type === 'OUT') {
                expectedCashBalance -= Number(movement.amount);
            }
        }

        return await prisma.cashSession.update({
            where: { id: parseInt(sessionId) },
            data: {
                closedAt: new Date(),
                status: 'CLOSED',
                expectedClosingBalance: expectedCashBalance,
                actualClosingBalance: actualBalances?.CASH || expectedCashBalance,
                differencesJson: differencesJson || {},
                notes
            }
        });
    }

    // -----------------------------------------------------
    // Cash Movements (Ingreso / Egreso)
    // -----------------------------------------------------
    async addMovement(data) {
        // Verify session is OPEN
        const session = await prisma.cashSession.findUnique({
            where: { id: data.sessionId }
        });

        if (!session || session.status !== 'OPEN') {
            throw new Error('El turno de caja no está abierto o no existe.');
        }

        return await prisma.cashMovement.create({
            data: {
                sessionId: data.sessionId,
                userId: data.userId,
                type: data.type, // 'IN' or 'OUT'
                amount: data.amount,
                reason: data.reason,
                tenantId: data.tenantId || "default"
            }
        });
    }
}

module.exports = new CashRegisterService();
