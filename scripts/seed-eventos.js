/**
 * Seed: 20 Productos para Rubro "Eventos y Decoración"
 * Tenant: 2914232f-50fa-4b2f-9826-4f451ff4b728
 *
 * Ejecución:
 *   cd Saas-Api && node scripts/seed-eventos.js
 */

const prisma = require("../src/config/prisma");

const TENANT_ID = "2914232f-50fa-4b2f-9826-4f451ff4b728";

async function main() {
  console.log(`\n🌸 Seeding Eventos tenant: ${TENANT_ID}\n`);

  // ─── 1. Categorías ──────────────────────────────────────────────────────────
  const categoryData = [
    { name: "Arcos y Estructuras", slug: "arcos-estructuras", description: "Arcos florales, estructuras metálicas y de madera para eventos." },
    { name: "Centros de Mesa", slug: "centros-de-mesa", description: "Centros florales, candelabros y composiciones para mesas." },
    { name: "Mobiliario", slug: "mobiliario", description: "Sillas Tiffany, mesas, sillones y muebles para eventos." },
    { name: "Iluminación", slug: "iluminacion", description: "Guirnaldas, faroles, velas y luces LED para ambientar." },
  ];

  const categories = {};
  for (const cat of categoryData) {
    const existing = await prisma.category.findFirst({
      where: { slug: cat.slug, tenantId: TENANT_ID },
    });
    if (existing) {
      categories[cat.slug] = existing;
      console.log(`  ✓ Categoría ya existe: ${cat.name}`);
    } else {
      const created = await prisma.category.create({
        data: { ...cat, tenantId: TENANT_ID },
      });
      categories[cat.slug] = created;
      console.log(`  + Categoría creada: ${cat.name}`);
    }
  }

  // ─── 2. Productos ─────────────────────────────────────────────────────────
  const products = [
    // Arcos y Estructuras
    {
      name: "Arco Floral de Pampas Premium",
      slug: "arco-floral-pampas-premium",
      description: "Arco de 2m x 2m con pampas grass natural, eucalipto y flores secas. Ideal para entradas de salones, photobooth o altar de ceremonias. Incluye estructura metálica dorada y montaje.",
      price: 85000,
      stock: 5,
      isNew: true,
      isTrending: true,
      imageUrl: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&q=80&w=800",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800",
      ]),
      categorySlug: "arcos-estructuras",
    },
    {
      name: "Arco Media Luna con Follaje Tropical",
      slug: "arco-media-luna-tropical",
      description: "Estructura semicircular de 2.4m de diámetro con palmas, helechos y flores tropicales. Perfecto para bodas en exteriores y eventos temáticos. Alquiler por 24 horas.",
      price: 72000,
      stock: 3,
      isNew: false,
      isTrending: true,
      imageUrl: "https://images.unsplash.com/photo-1509927083803-4bd519298ac4?auto=format&fit=crop&q=80&w=800",
      images: JSON.stringify(["https://images.unsplash.com/photo-1509927083803-4bd519298ac4?auto=format&fit=crop&q=80&w=800"]),
      categorySlug: "arcos-estructuras",
    },
    {
      name: "Backdrop Espejo Dorado con Flores",
      slug: "backdrop-espejo-dorado",
      description: "Panel de espejo de 2m x 1m en marco dorado con composición floral a medida. Incluye soporte y decoración en la parte superior. Perfecto como photobooth.",
      price: 65000,
      stock: 4,
      isNew: true,
      isTrending: false,
      imageUrl: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=800",
      images: JSON.stringify(["https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=800"]),
      categorySlug: "arcos-estructuras",
    },
    {
      name: "Columnas Florales para Altar",
      slug: "columnas-florales-altar",
      description: "Par de columnas de 1.8m con florales en blanco y verde. Diseño clásico y elegante. Incluye base pesa y transporte en CABA y GBA. Precio por par.",
      price: 45000,
      stock: 6,
      isNew: false,
      isTrending: false,
      imageUrl: "https://images.unsplash.com/photo-1544923555-52055627db8a?auto=format&fit=crop&q=80&w=800",
      images: JSON.stringify(["https://images.unsplash.com/photo-1544923555-52055627db8a?auto=format&fit=crop&q=80&w=800"]),
      categorySlug: "arcos-estructuras",
    },
    {
      name: "Panel de Globos Orgánicos 2x2m",
      slug: "panel-globos-organicos",
      description: "Composición de globos de látex en colores pasteles y neutros, formato panel 2x2m. Incluye instalación. Ideal para fiestas de cumpleaños, baby shower y eventos infantiles.",
      price: 38000,
      stock: 8,
      isNew: true,
      isTrending: true,
      imageUrl: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=800",
      images: JSON.stringify(["https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=800"]),
      categorySlug: "arcos-estructuras",
    },

    // Centros de Mesa
    {
      name: "Centro de Mesa con Peonías y Eucalipto",
      slug: "centro-mesa-peonias-eucalipto",
      description: "Centro floral en florero de vidrio alto (50cm) con peonías, ranúnculos y eucalipto. Paleta romántica en rosa y blanco. Precio por unidad, mínimo 5 unidades para eventos.",
      price: 12500,
      stock: 30,
      isNew: false,
      isTrending: true,
      imageUrl: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800",
      images: JSON.stringify(["https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800"]),
      categorySlug: "centros-de-mesa",
    },
    {
      name: "Candelabro de Hierro con Florales",
      slug: "candelabro-hierro-florales",
      description: "Candelabro de hierro negro (70cm) con porta velas y composición floral en tonos terracota y blanco. Incluye vela. Ideal para bodas rústicas y eventos de otoño.",
      price: 18000,
      stock: 15,
      isNew: true,
      isTrending: false,
      imageUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800",
      images: JSON.stringify(["https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800"]),
      categorySlug: "centros-de-mesa",
    },
    {
      name: "Centro Bajo con Flores Secas y Pampas",
      slug: "centro-bajo-flores-secas-pampas",
      description: "Composición baja y circular con pampas grass, flores secas y ramas naturales. Diseño boho-chic. Ideal para largas mesas de banquete. Precio por unidad.",
      price: 9800,
      stock: 25,
      isNew: false,
      isTrending: true,
      imageUrl: "https://images.unsplash.com/photo-1487530811015-780dff50dbda?auto=format&fit=crop&q=80&w=800",
      images: JSON.stringify(["https://images.unsplash.com/photo-1487530811015-780dff50dbda?auto=format&fit=crop&q=80&w=800"]),
      categorySlug: "centros-de-mesa",
    },
    {
      name: "Terrario de Vidrio con Suculentas",
      slug: "terrario-vidrio-suculentas",
      description: "Terrario geométrico de vidrio (25cm) con suculentas variadas y piedras decorativas. Souvenir funcional que los invitados pueden llevarse. Precio unitario.",
      price: 7500,
      stock: 50,
      isNew: true,
      isTrending: false,
      imageUrl: "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?auto=format&fit=crop&q=80&w=800",
      images: JSON.stringify(["https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?auto=format&fit=crop&q=80&w=800"]),
      categorySlug: "centros-de-mesa",
    },
    {
      name: "Lámpara de Mesa Floral LED",
      slug: "lampara-mesa-floral-led",
      description: "Lámpara de sobremesa con pantalla de flores naturales prensadas e iluminación LED cálida. Crea una atmósfera única. Funciona a pila (incluidas). Precio por unidad.",
      price: 14500,
      stock: 20,
      isNew: true,
      isTrending: true,
      imageUrl: "https://images.unsplash.com/photo-1495121553079-4c61bcce1894?auto=format&fit=crop&q=80&w=800",
      images: JSON.stringify(["https://images.unsplash.com/photo-1495121553079-4c61bcce1894?auto=format&fit=crop&q=80&w=800"]),
      categorySlug: "centros-de-mesa",
    },

    // Mobiliario
    {
      name: "Sillas Tiffany Blancas (pack x10)",
      slug: "sillas-tiffany-blancas",
      description: "Pack de 10 sillas Tiffany de resina en color blanco. Ideales para bodas, comuniones y eventos formales. Resistentes y elegantes. Incluye transporte en CABA y GBA.",
      price: 28000,
      stock: 20,
      isNew: false,
      isTrending: true,
      imageUrl: "https://images.unsplash.com/photo-1589139316629-87a41951f215?auto=format&fit=crop&q=80&w=800",
      images: JSON.stringify(["https://images.unsplash.com/photo-1589139316629-87a41951f215?auto=format&fit=crop&q=80&w=800"]),
      categorySlug: "mobiliario",
    },
    {
      name: "Mesa Rectangular de Madera Rústica (180cm)",
      slug: "mesa-rectangular-madera-rustica",
      description: "Mesa de madera maciza estilo rústico de 180x80cm. Ideal para largas mesas de banquete. Se alquila con o sin mantel. Incluye transporte.",
      price: 22000,
      stock: 10,
      isNew: false,
      isTrending: false,
      imageUrl: "https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?auto=format&fit=crop&q=80&w=800",
      images: JSON.stringify(["https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?auto=format&fit=crop&q=80&w=800"]),
      categorySlug: "mobiliario",
    },
    {
      name: "Sillones Rattan Blancos (par)",
      slug: "sillones-rattan-blancos-par",
      description: "Par de sillones de rattan con cojines de lino blanco. Perfectos para photobooth de novios o rincón romántico. Precio por el par.",
      price: 35000,
      stock: 5,
      isNew: true,
      isTrending: true,
      imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800",
      images: JSON.stringify(["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800"]),
      categorySlug: "mobiliario",
    },
    {
      name: "Barra de Madera para Tragos",
      slug: "barra-madera-tragos",
      description: "Barra de madera de 1.5m x 0.5m, estilo rústico, para armar tu propio servicio de bebidas. Incluye estante trasero. Perfecta para eventos al aire libre y casamientos temáticos.",
      price: 40000,
      stock: 4,
      isNew: false,
      isTrending: false,
      imageUrl: "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&q=80&w=800",
      images: JSON.stringify(["https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&q=80&w=800"]),
      categorySlug: "mobiliario",
    },
    {
      name: "Mesa de Tronco con Vidrio (80cm)",
      slug: "mesa-tronco-vidrio",
      description: "Mesa ratona con base de tronco natural y tapa de vidrio templado de 80cm. Diseño único e irrepetible. Ideal para salones con decoración orgánica y bohemia.",
      price: 55000,
      stock: 3,
      isNew: true,
      isTrending: false,
      imageUrl: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=800",
      images: JSON.stringify(["https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=800"]),
      categorySlug: "mobiliario",
    },

    // Iluminación
    {
      name: "Guirnalda de Luces Edison (10m)",
      slug: "guirnalda-luces-edison",
      description: "Guirnalda de 10 metros con 20 lamparitas Edison de 4W. Luz cálida y romántica. Ideal para terraza, jardín o salón. Se vende y alquila. Incluye cable.",
      price: 8500,
      stock: 30,
      isNew: false,
      isTrending: true,
      imageUrl: "https://images.unsplash.com/photo-1606422614378-4b34a46be8c7?auto=format&fit=crop&q=80&w=800",
      images: JSON.stringify(["https://images.unsplash.com/photo-1606422614378-4b34a46be8c7?auto=format&fit=crop&q=80&w=800"]),
      categorySlug: "iluminacion",
    },
    {
      name: "Farolitos de Papel Origami (pack x12)",
      slug: "farolitos-papel-origami",
      description: "Pack de 12 farolitos de papel de arroz estilo origami en tonos crema, rosa y terracota. Se cuelgan del techo o de árboles. Añaden un toque vintage y acogedor al ambiente.",
      price: 4200,
      stock: 40,
      isNew: false,
      isTrending: false,
      imageUrl: "https://images.unsplash.com/photo-1532499016263-f2c3e89de9cd?auto=format&fit=crop&q=80&w=800",
      images: JSON.stringify(["https://images.unsplash.com/photo-1532499016263-f2c3e89de9cd?auto=format&fit=crop&q=80&w=800"]),
      categorySlug: "iluminacion",
    },
    {
      name: "Velas Flotantes con Base de Cristal (pack x6)",
      slug: "velas-flotantes-cristal",
      description: "Set de 6 bases de cristal con velas flotantes. Se llenan con agua y flores para crear un centro de mesa increíble. Precio incluye velas de 4 horas de duración.",
      price: 6800,
      stock: 25,
      isNew: true,
      isTrending: false,
      imageUrl: "https://images.unsplash.com/photo-1467987506553-8f3916508521?auto=format&fit=crop&q=80&w=800",
      images: JSON.stringify(["https://images.unsplash.com/photo-1467987506553-8f3916508521?auto=format&fit=crop&q=80&w=800"]),
      categorySlug: "iluminacion",
    },
    {
      name: "Estrella de Mimbre con Luces LED",
      slug: "estrella-mimbre-luces-led",
      description: "Estrella decorativa de mimbre natural (80cm) con 50 microluces LED blancas integradas. Cuelga en cualquier espacio y crea una iluminación mágica. Funciona a USB.",
      price: 16000,
      stock: 12,
      isNew: true,
      isTrending: true,
      imageUrl: "https://images.unsplash.com/photo-1543946207-39bd91e70ca7?auto=format&fit=crop&q=80&w=800",
      images: JSON.stringify(["https://images.unsplash.com/photo-1543946207-39bd91e70ca7?auto=format&fit=crop&q=80&w=800"]),
      categorySlug: "iluminacion",
    },
    {
      name: "Proyector de Estrellas Portátil",
      slug: "proyector-estrellas-portatil",
      description: "Proyector de efecto estrellado que cubre hasta 40m² de techo y paredes. Incluye control remoto con 16 colores RGB y función nube. Perfecto para eventos nocturnos y ambientes especiales.",
      price: 19500,
      stock: 8,
      isNew: true,
      isTrending: true,
      imageUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&q=80&w=800",
      images: JSON.stringify(["https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&q=80&w=800"]),
      categorySlug: "iluminacion",
    },
  ];

  let created = 0;
  let skipped = 0;

  for (const prod of products) {
    const cat = categories[prod.categorySlug];
    if (!cat) {
      console.warn(`  ⚠ Categoría no encontrada: ${prod.categorySlug}`);
      continue;
    }

    const existing = await prisma.product.findFirst({
      where: { name: prod.name, tenantId: TENANT_ID },
    });

    if (existing) {
      skipped++;
      console.log(`  - Ya existe: ${prod.name}`);
      continue;
    }

    // Parse images from JSON string to array
    const imagesArr = JSON.parse(prod.images || "[]");

    const createdProduct = await prisma.product.create({
      data: {
        tenantId: TENANT_ID,
        name: prod.name,
        description: prod.description,
        basePrice: prod.price,
        brand: "Deco Eventos",
        type: "PHYSICAL",
        isNew: prod.isNew,
        isTrending: prod.isTrending,
        images: imagesArr,
        categoryId: cat.id,
        isActive: true,
        saleMode: "VENTA",
        characteristics: [],
      },
    });

    // Create default SKU
    await prisma.sKU.create({
      data: {
        tenantId: TENANT_ID,
        productId: createdProduct.id,
        code: `EVT-${createdProduct.id}-${Date.now()}`,
        price: prod.price,
        stock: prod.stock,
        isAutoGenerated: true,
      },
    });

    created++;
    console.log(`  ✅ Creado: ${prod.name}`);
  }

  console.log(`\n✨ Seed completado: ${created} productos creados, ${skipped} ya existían.`);
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
