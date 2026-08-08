const fs = require('fs');

const schema = fs.readFileSync('/home/ale/Documentos/PROYECTOS/ECOMMERCE- L/Saas-Api/prisma/schema.prisma', 'utf8');

const excludeModels = [
  'Tenant', 'SaaSPlan', 'TenantPayment', 'Rubro', 'VariantOption', 
  'Permission', 'Cart', 'CartItem', 'Notification', 'RefreshToken', 
  'PointsHistory', 'Comment', 'SaleItem', 'PaymentTransaction', 
  'StockReservation', 'AccessLog', 'Transfer', 'BranchInventory', 
  'UserBranch', 'StockTransfer', 'StockTransferItem', 'SupplierSKU', 
  'PurchaseItem', 'StockMovement', 'ChatMessage'
];

const models = [];
let currentModel = null;
schema.split('\n').forEach(line => {
    const match = line.match(/^model\s+(\w+)\s+\{/);
    if (match) {
        currentModel = { name: match[1], hasTenantId: false };
        models.push(currentModel);
    } else if (currentModel && line.trim().startsWith('tenantId ')) {
        currentModel.hasTenantId = true;
    } else if (currentModel && line.trim() === '}') {
        currentModel = null;
    }
});

const problematic = models.filter(m => !m.hasTenantId && !excludeModels.includes(m.name));
console.log('Problematic models (No tenantId and NOT excluded):');
console.log(problematic.map(m => m.name));
