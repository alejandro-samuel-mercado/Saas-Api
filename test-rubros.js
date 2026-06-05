require("dotenv").config();
const prisma = require("./src/config/prisma");
async function main() {
  const rubros = await prisma.rubro.findMany();
  console.log("Rubros:", rubros);
  
  const tenant = await prisma.tenant.findFirst();
  console.log("Tenant:", tenant.name, "rubroId:", tenant.rubroId);

  const productCount = await prisma.product.count({
    where: { tenantId: tenant.id }
  });
  console.log("Products for this tenant:", productCount);
  
  const productsWithRubro = await prisma.product.findMany({
    where: { tenantId: tenant.id },
    select: { name: true, rubroId: true },
    take: 5
  });
  console.log("Products with rubro:", productsWithRubro);
}
main().catch(console.error).finally(() => prisma.$disconnect());
