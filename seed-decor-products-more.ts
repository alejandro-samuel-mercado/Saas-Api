import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const rubro = await prisma.rubro.findUnique({ where: { slug: 'decoracion' } });
  if (!rubro) throw new Error("Rubro decoracion not found");

  const tenant = await prisma.tenant.findFirst({
    where: { rubroId: rubro.id }
  });
  if (!tenant) throw new Error("Decor tenant not found");

  let category = await prisma.category.findFirst({
    where: { tenantId: tenant.id, slug: "nuevas-colecciones" }
  });

  if (!category) {
     category = await prisma.category.create({
       data: {
         name: "Nuevas Colecciones",
         slug: "nuevas-colecciones",
         tenantId: tenant.id,
         imageUrl: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=800",
         isActive: true
       }
     });
  }

  for (let i = 1; i <= 15; i++) {
    await prisma.product.create({
      data: {
        tenantId: tenant.id,
        name: `Decor Item Nuevo ${i}`,
        description: `Exclusivo item de decoración para eventos premium.`,
        basePrice: 15000 + i * 2000,
        images: ["https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=800"],
        saleMode: "ALQUILER",
        isActive: true,
        isTrending: true,
        isNew: true,
        categoryId: category.id,
        brand: "Fleur Premium",
        type: "PRODUCT",
        skus: {
          create: [
            {
              code: `DEC-NEW-${i}-SKU-${Date.now()}`,
              stock: 20,
              price: 15000 + i * 2000,
            }
          ]
        }
      }
    });
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
