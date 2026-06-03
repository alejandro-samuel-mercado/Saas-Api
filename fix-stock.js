const prisma = require('./src/config/prisma');

async function fix() {
  const tenantId = '48758d33-947f-4724-afce-17e13f72730a';
  const branch = await prisma.branch.findFirst({ where: { tenantId, isHeadquarters: true } });
  if (!branch) return console.log("No branch found");

  const skus = await prisma.sKU.findMany({
    where: { tenantId },
    include: { branchInventory: true }
  });

  for (const sku of skus) {
    if (sku.branchInventory.length === 0 && sku.stock > 0) {
      await prisma.branchInventory.create({
        data: {
          skuId: sku.id,
          branchId: branch.id,
          stock: sku.stock,
          minStock: 1,
          maxStock: 100,
          price: sku.price
        }
      });
      console.log(`Created inventory for SKU ${sku.code} with stock ${sku.stock}`);
    }
  }
  console.log("Done");
}
fix().catch(console.error).finally(() => prisma.$disconnect());
