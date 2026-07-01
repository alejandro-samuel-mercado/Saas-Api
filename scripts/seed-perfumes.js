/**
 * Seed: 20 Productos para Rubro "Perfumes"
 * Tenant: 440f62a6-2a19-4474-8760-a81708c8cbad
 *
 * Ejecución:
 *   cd Saas-Api && node scripts/seed-perfumes.js
 */

const prisma = require("../src/config/prisma");

const TENANT_ID = "440f62a6-2a19-4474-8760-a81708c8cbad";

async function main() {
  console.log(`\n✨ Seeding Perfumería tenant: ${TENANT_ID}\n`);

  const categoryData = [
    { name: "Fragancias Femeninas", slug: "fragancias-femeninas", description: "Las esencias más cautivadoras para mujer." },
    { name: "Fragancias Masculinas", slug: "fragancias-masculinas", description: "Perfumes con carácter para hombre." },
    { name: "Unisex & Nicho", slug: "unisex-nicho", description: "Obras maestras olfativas sin género." },
    { name: "Sets & Regalos", slug: "sets-regalos", description: "Kits de lujo ideales para regalar." },
  ];

  const categories = {};
  for (const cat of categoryData) {
    const existing = await prisma.category.findFirst({
      where: { slug: cat.slug, tenantId: TENANT_ID },
    });
    if (existing) {
      categories[cat.slug] = existing;
    } else {
      const created = await prisma.category.create({
        data: { ...cat, tenantId: TENANT_ID },
      });
      categories[cat.slug] = created;
    }
  }

  const products = [
    { name: "Chanel N°5 Eau de Parfum", description: "El perfume más icónico.", price: 150, stock: 10, isNew: false, isTrending: true, images: ["https://images.unsplash.com/photo-1541643600914-78b084683702?auto=format&fit=crop&q=80&w=800"], categorySlug: "fragancias-femeninas" },
    { name: "Dior Sauvage Eau de Toilette", description: "Fresco y salvaje.", price: 120, stock: 15, isNew: false, isTrending: true, images: ["https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800"], categorySlug: "fragancias-masculinas" },
    { name: "Baccarat Rouge 540", description: "Ámbar floral amaderado.", price: 350, stock: 5, isNew: true, isTrending: true, images: ["https://images.unsplash.com/photo-1628149462102-14309489fc99?auto=format&fit=crop&q=80&w=800"], categorySlug: "unisex-nicho" },
    { name: "Yves Saint Laurent Libre", description: "Lavanda floral.", price: 140, stock: 12, isNew: true, isTrending: false, images: ["https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&q=80&w=800"], categorySlug: "fragancias-femeninas" },
    { name: "Tom Ford Oud Wood", description: "Madera exótica y especias.", price: 280, stock: 8, isNew: false, isTrending: true, images: ["https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=800"], categorySlug: "fragancias-masculinas" },
    { name: "Creed Aventus", description: "Frutal y ahumado.", price: 400, stock: 6, isNew: false, isTrending: true, images: ["https://images.unsplash.com/photo-1583526978500-24458ee24498?auto=format&fit=crop&q=80&w=800"], categorySlug: "unisex-nicho" },
    { name: "Carolina Herrera Good Girl", description: "Haba tonka y cacao.", price: 130, stock: 20, isNew: false, isTrending: true, images: ["https://images.unsplash.com/photo-1615526689626-d98c08ecba30?auto=format&fit=crop&q=80&w=800"], categorySlug: "fragancias-femeninas" },
    { name: "Giorgio Armani Acqua di Giò", description: "Clásico marino.", price: 90, stock: 25, isNew: false, isTrending: false, images: ["https://images.unsplash.com/photo-1610461888750-10bfc601b874?auto=format&fit=crop&q=80&w=800"], categorySlug: "fragancias-masculinas" },
    { name: "Le Labo Santal 33", description: "Sándalo adictivo.", price: 290, stock: 7, isNew: true, isTrending: true, images: ["https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800"], categorySlug: "unisex-nicho" },
    { name: "Paco Rabanne 1 Million", description: "Cuero especiado.", price: 100, stock: 30, isNew: false, isTrending: true, images: ["https://images.unsplash.com/photo-1595425970377-c9703c48657a?auto=format&fit=crop&q=80&w=800"], categorySlug: "fragancias-masculinas" },
    { name: "Set Dior Miniaturas", description: "4 clásicos femeninos.", price: 180, stock: 5, isNew: true, isTrending: false, images: ["https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&q=80&w=800"], categorySlug: "sets-regalos" },
    { name: "Jo Malone Peony & Blush", description: "Floral jugoso.", price: 160, stock: 14, isNew: false, isTrending: false, images: ["https://images.unsplash.com/photo-1629828461771-0db35a115be3?auto=format&fit=crop&q=80&w=800"], categorySlug: "fragancias-femeninas" },
    { name: "Bleu de Chanel", description: "Amaderado aromático.", price: 155, stock: 12, isNew: false, isTrending: true, images: ["https://images.unsplash.com/photo-1592914610354-fd354ea45e48?auto=format&fit=crop&q=80&w=800"], categorySlug: "fragancias-masculinas" },
    { name: "Byredo Gypsy Water", description: "Fresco y amaderado.", price: 220, stock: 9, isNew: true, isTrending: false, images: ["https://images.unsplash.com/photo-1610461888750-10bfc601b874?auto=format&fit=crop&q=80&w=800"], categorySlug: "unisex-nicho" },
    { name: "Set Regalo Hombre Armani", description: "Acqua di Giò + Aftershave.", price: 140, stock: 8, isNew: false, isTrending: false, images: ["https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=800"], categorySlug: "sets-regalos" },
    { name: "Lancôme La Vie Est Belle", description: "Iris gourmand.", price: 110, stock: 22, isNew: false, isTrending: true, images: ["https://images.unsplash.com/photo-1615526689626-d98c08ecba30?auto=format&fit=crop&q=80&w=800"], categorySlug: "fragancias-femeninas" },
    { name: "Hermès Terre d'Hermès", description: "Mineral y amaderado.", price: 125, stock: 18, isNew: false, isTrending: false, images: ["https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800"], categorySlug: "fragancias-masculinas" },
    { name: "Maison Margiela Jazz Club", description: "Ron y tabaco rubio.", price: 145, stock: 11, isNew: true, isTrending: true, images: ["https://images.unsplash.com/photo-1628149462102-14309489fc99?auto=format&fit=crop&q=80&w=800"], categorySlug: "unisex-nicho" },
    { name: "Versace Eros", description: "Menta, manzana y tonka.", price: 95, stock: 28, isNew: false, isTrending: true, images: ["https://images.unsplash.com/photo-1592914610354-fd354ea45e48?auto=format&fit=crop&q=80&w=800"], categorySlug: "fragancias-masculinas" },
    { name: "Set de Descubrimiento Nicho", description: "10 viales de lujo.", price: 80, stock: 15, isNew: true, isTrending: true, images: ["https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&q=80&w=800"], categorySlug: "sets-regalos" },
  ];

  for (const prod of products) {
    const cat = categories[prod.categorySlug];
    if (!cat) continue;

    const existing = await prisma.product.findFirst({
      where: { name: prod.name, tenantId: TENANT_ID },
    });

    if (existing) continue;

    const createdProduct = await prisma.product.create({
      data: {
        tenantId: TENANT_ID,
        name: prod.name,
        description: prod.description,
        basePrice: prod.price,
        brand: "Maison de Parfum",
        type: "PHYSICAL",
        isNew: prod.isNew,
        isTrending: prod.isTrending,
        images: prod.images,
        categoryId: cat.id,
        isActive: true,
        saleMode: "VENTA",
        characteristics: [],
      },
    });

    await prisma.sKU.create({
      data: {
        tenantId: TENANT_ID,
        productId: createdProduct.id,
        code: `PERF-${createdProduct.id}-${Date.now()}`,
        price: prod.price,
        stock: prod.stock,
        isAutoGenerated: true,
      },
    });
  }

  console.log(`✅ Seed de perfumes completado.`);
}

main().finally(() => prisma.$disconnect());
