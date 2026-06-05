import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const rubro = await prisma.rubro.findUnique({ where: { slug: 'decoracion' } });
  if (!rubro) throw new Error("Rubro decoracion not found");

  const tenant = await prisma.tenant.findFirst({
    where: { rubroId: rubro.id }
  });
  if (!tenant) throw new Error("Decor tenant not found");

  // Get a category for decoracion
  let category = await prisma.category.findFirst({
    where: { tenantId: tenant.id }
  });

  if (!category) {
     category = await prisma.category.create({
       data: {
         name: "Colección General",
         slug: "coleccion-general",
         tenantId: tenant.id,
         imageUrl: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800",
         isActive: true
       }
     });
  }

  console.log(`Seeding for tenant: ${tenant.id}, category: ${category.id}`);

  // Create products
  for (let i = 1; i <= 15; i++) {
    const product = await prisma.product.create({
      data: {
        tenantId: tenant.id,
        name: `Decor Item ${i}`,
        description: `This is a high quality decor item for your event. Very beautiful and elegant. Item number ${i}.`,
        basePrice: 5000 + i * 1000,
        images: ["https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800"],
        saleMode: i % 2 === 0 ? "VENTA" : "ALQUILER",
        isActive: true,
        categoryId: category.id,
        brand: "Fleur Events",
        type: "PRODUCT",
        skus: {
          create: [
            {
              code: `DEC-${i}-SKU-${Date.now()}`,
              stock: 10,
              price: 5000 + i * 1000,
            }
          ]
        }
      }
    });
    console.log(`Created product: ${product.name}`);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
