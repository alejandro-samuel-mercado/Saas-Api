require("dotenv").config();
const prisma = require("./src/config/prisma");
async function main() {
  const tenant = await prisma.tenant.findFirst();
  console.log("Tenant ID:", tenant.id, "rubroId:", tenant.rubroId);

  const products = await prisma.product.findMany({
    where: {
      tenantId: tenant.id,
      categoryId: {
        in: (await prisma.category.findMany({
          where: { tenantId: tenant.id }
        })).map(c => c.id)
      }
    },
    select: { name: true, rubroId: true, category: { select: { name: true } } }
  });
  console.log("Products in this tenant's categories:", products.length);
  console.log(products);
}
main().catch(console.error).finally(() => prisma.$disconnect());
