const prisma = require('./src/config/prisma.js');

async function main() {
  const tenantId = '48758d33-947f-4724-afce-17e13f72730a';
  
  let category = await prisma.category.findFirst({
    where: { tenantId: tenantId }
  });

  for (let i = 21; i <= 35; i++) {
    const product = await prisma.product.create({
      data: {
        tenantId: tenantId,
        name: `Decor VIP Item ${i}`,
        description: `Exclusivo item VIP de decoración para eventos premium.`,
        basePrice: 20000 + i * 2000,
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
              code: `DEC-VIP-${i}-SKU-${Date.now()}`,
              stock: 20,
              price: 20000 + i * 2000,
            }
          ]
        }
      }
    });
    console.log(`Created product: ${product.name}`);
  }
}
main().then(() => console.log('Done')).catch(console.error);
