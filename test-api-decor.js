const { basePrisma: prisma } = require('./src/config/prisma.js');
const ProductService = require('./src/services/product.service.js');

async function test() {
  // Mock tenantId behavior
  const params = { page: 1, limit: 20, rubroId: 5 }; // We need to find the correct rubroId, wait, we don't need it if we pass tenantId?
  // Actually ProductController passes rubroId = req.tenant.rubroId
  
  // Let's just find the products directly via prisma to see if there's any reason they wouldn't show up
  const products = await prisma.product.findMany({
    where: { tenantId: '48758d33-947f-4724-afce-17e13f72730a' },
    include: { skus: { include: { branchInventory: true } } }
  });
  
  console.log(`Total DB products for tenant: ${products.length}`);
  
  let withBranchInv = 0;
  for (const p of products) {
    let hasInv = false;
    for (const sku of p.skus) {
      if (sku.branchInventory && sku.branchInventory.length > 0) hasInv = true;
    }
    if (hasInv) withBranchInv++;
  }
  
  console.log(`Products with branch inventory: ${withBranchInv}`);
}
test().catch(console.error).finally(() => process.exit(0));
