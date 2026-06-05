require("dotenv").config();
const prisma = require("../src/config/prisma");

async function main() {
  const branches = await prisma.branch.findMany();
  const skus = await prisma.sKU.findMany({
    where: { branchInventory: { none: {} } }
  });
  
  let count = 0;
  for (const sku of skus) {
    for (const branch of branches) {
      await prisma.branchInventory.create({
        data: {
          skuId: sku.id,
          branchId: branch.id,
          stock: sku.stock,
          price: sku.price,
          isActive: true
        }
      });
      count++;
    }
  }
  console.log(`Created ${count} branch inventory records for ${skus.length} SKUs.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
