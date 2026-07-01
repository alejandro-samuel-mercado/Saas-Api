/**
 * Seed: 20 Productos para Rubro "Barbería"
 * Tenant: 80e365de-9330-4957-b512-b17e036a5961
 *
 * Ejecución:
 *   cd Saas-Api && node scripts/seed-barberias.js
 */

const prisma = require("../src/config/prisma");

const TENANT_ID = "80e365de-9330-4957-b512-b17e036a5961";

async function main() {
  console.log(`\n✂️  Seeding Barbería tenant: ${TENANT_ID}\n`);

  // ─── 1. Categorías ──────────────────────────────────────────────────────────
  const categoryData = [
    { name: "Cortes y Servicios", slug: "cortes-y-servicios", description: "Cortes de cabello, afeitados y servicios de barbería." },
    { name: "Cuidado de Barba", slug: "cuidado-de-barba", description: "Aceites, balsamás y productos para el cuidado de la barba." },
    { name: "Productos Capilares", slug: "productos-capilares", description: "Ceras, pomadas, shampoos y tratamientos para el cabello." },
    { name: "Accesorios", slug: "accesorios-barberia", description: "Navajas, peines, brochas y accesorios profesionales." },
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
    // Cortes y Servicios
    {
      name: "Corte Clásico de Cabello",
      description: "Corte de cabello clásico con tijera y máquina. Incluye lavado con shampoo y acondicionador profesional, secado y peinado final. Técnica tradicional barbera con acabado impecable.",
      price: 4500,
      stock: 999,
      isNew: false,
      isTrending: true,
      images: ["https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800"],
      categorySlug: "cortes-y-servicios",
      type: "SERVICE",
    },
    {
      name: "Corte + Arreglo de Barba",
      description: "Pack completo: corte de cabello a elección más arreglo y perfilado de barba con navaja caliente. Incluye aceite hidratante para barba y toalla caliente. El servicio más solicitado de la casa.",
      price: 7500,
      stock: 999,
      isNew: false,
      isTrending: true,
      images: ["https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=800"],
      categorySlug: "cortes-y-servicios",
      type: "SERVICE",
    },
    {
      name: "Afeitado Clásico con Navaja",
      description: "Afeitado artesanal con navaja de barbero, toalla caliente y fría, pre-shave oil y bálsamo post-afeitado. Una experiencia de relax y cuidado masculino único.",
      price: 5500,
      stock: 999,
      isNew: true,
      isTrending: false,
      images: ["https://images.unsplash.com/photo-1534126511673-b6899657816a?auto=format&fit=crop&q=80&w=800"],
      categorySlug: "cortes-y-servicios",
      type: "SERVICE",
    },
    {
      name: "Tratamiento Capilar Anti-caída",
      description: "Tratamiento profundo con masaje capilar de 15 minutos, aplicación de sérum anticaída y acondicionador de keratina. Ideal para cabello debilitado o con caída excesiva.",
      price: 6000,
      stock: 999,
      isNew: true,
      isTrending: false,
      images: ["https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&q=80&w=800"],
      categorySlug: "cortes-y-servicios",
      type: "SERVICE",
    },
    {
      name: "Coloración para Barba",
      description: "Servicio de coloración y tinte para barba con productos profesionales sin amoníaco. Incluye consulta de color, aplicación y fijación. Resultado natural que dura hasta 4 semanas.",
      price: 4000,
      stock: 999,
      isNew: false,
      isTrending: false,
      images: ["https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&q=80&w=800"],
      categorySlug: "cortes-y-servicios",
      type: "SERVICE",
    },

    // Cuidado de Barba
    {
      name: "Aceite de Barba Premium 30ml",
      description: "Aceite nutritivo para barba con jojoba, argán y vitamina E. Hidrata, suaviza y controla el pelo de barba rebelde. Aroma a madera y cuero. Ideal para uso diario. Hecho en Argentina.",
      price: 3200,
      stock: 40,
      isNew: true,
      isTrending: true,
      images: ["https://images.unsplash.com/photo-1612528443702-f6741f70a049?auto=format&fit=crop&q=80&w=800"],
      categorySlug: "cuidado-de-barba",
      type: "PHYSICAL",
    },
    {
      name: "Bálsamo Hidratante de Barba 100ml",
      description: "Bálsamo leave-in para barba con manteca de karité y aceite de coco. Domina y da forma a la barba larga, eliminando la sequedad y el picor. Textura ligera, absorción rápida.",
      price: 2800,
      stock: 35,
      isNew: false,
      isTrending: true,
      images: ["https://images.unsplash.com/photo-1543500258-f1d52960c0c9?auto=format&fit=crop&q=80&w=800"],
      categorySlug: "cuidado-de-barba",
      type: "PHYSICAL",
    },
    {
      name: "Shampoo para Barba 200ml",
      description: "Shampoo específico para barba y bigote, con extracto de menta y aloe vera. Limpia en profundidad sin resecar. Estimula el crecimiento y fortalece cada pelo. Sin sulfatos ni parabenos.",
      price: 2200,
      stock: 50,
      isNew: false,
      isTrending: false,
      images: ["https://images.unsplash.com/photo-1607006344380-b6775a0824a7?auto=format&fit=crop&q=80&w=800"],
      categorySlug: "cuidado-de-barba",
      type: "PHYSICAL",
    },
    {
      name: "Cera para Bigote 15ml",
      description: "Cera firme para bigote con cera de abeja y aceite de almendras. Modela y mantiene cualquier estilo de bigote con fijación fuerte todo el día. Sin brillos grasos. 100% natural.",
      price: 1800,
      stock: 30,
      isNew: true,
      isTrending: false,
      images: ["https://images.unsplash.com/photo-1590439471364-192aa70c0b53?auto=format&fit=crop&q=80&w=800"],
      categorySlug: "cuidado-de-barba",
      type: "PHYSICAL",
    },
    {
      name: "Kit Starter Barba (4 productos)",
      description: "Set completo para comenzar a cuidar tu barba: aceite 30ml + bálsamo 100ml + shampoo 200ml + peine de madera. Presentación en caja de regalo. Perfecto como presente para el hombre moderno.",
      price: 8900,
      stock: 20,
      isNew: true,
      isTrending: true,
      images: ["https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&q=80&w=800"],
      categorySlug: "cuidado-de-barba",
      type: "PHYSICAL",
    },

    // Productos Capilares
    {
      name: "Pomada Mate Fijación Fuerte 100ml",
      description: "Pomada con cera de abeja y aceite de argán. Fijación ultra fuerte sin brillo graso. Permite remodelar el peinado durante el día. Aroma a madera suave. Lavado fácil con agua.",
      price: 2500,
      stock: 45,
      isNew: false,
      isTrending: true,
      images: ["https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=800"],
      categorySlug: "productos-capilares",
      type: "PHYSICAL",
    },
    {
      name: "Pomada con Brillo Clásico 100ml",
      description: "Pomada brillante al agua con fijación media-alta, ideal para peinados clásicos tipo pompadour y slick. Fácil de lavar. Contiene glicerina y pantenol para nutrir el cabello mientras estilizás.",
      price: 2500,
      stock: 40,
      isNew: false,
      isTrending: false,
      images: ["https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=800"],
      categorySlug: "productos-capilares",
      type: "PHYSICAL",
    },
    {
      name: "Shampoo Masculino Anticaspa 400ml",
      description: "Shampoo con zinc y ketoconazol para combatir la caspa y el cuero cabelludo graso. Fórmula refrescante con menta y eucalipto. Uso diario. Fortalece el cabello desde la raíz.",
      price: 1900,
      stock: 60,
      isNew: false,
      isTrending: false,
      images: ["https://images.unsplash.com/photo-1631397913148-e1f3e57fbbef?auto=format&fit=crop&q=80&w=800"],
      categorySlug: "productos-capilares",
      type: "PHYSICAL",
    },
    {
      name: "Arcilla Modeladora 100ml",
      description: "Arcilla natural de alta fijación con acabado mate y efecto texturizante. Ideal para dar volumen y definición a cortes cortos y medianos. No se endurece. Aroma amaderado masculino.",
      price: 2700,
      stock: 35,
      isNew: true,
      isTrending: true,
      images: ["https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800"],
      categorySlug: "productos-capilares",
      type: "PHYSICAL",
    },
    {
      name: "Sérum Anticaída y Crecimiento 50ml",
      description: "Sérum concentrado con biotina, cafeína y minoxidil natural. Estimula los folículos y frena la caída. Aplicación directa en cuero cabelludo. 1 frasco dura hasta 2 meses con uso diario.",
      price: 4500,
      stock: 25,
      isNew: true,
      isTrending: false,
      images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800"],
      categorySlug: "productos-capilares",
      type: "PHYSICAL",
    },

    // Accesorios
    {
      name: "Navaja de Afeitar Clásica + 5 Hojas",
      description: "Navaja de afeitar de doble hoja en acero inoxidable con mango de zinc cromado. Incluye 5 hojas de repuesto. Afeitado preciso, sin irritación. El clásico de todo barber shop que se respete.",
      price: 3500,
      stock: 30,
      isNew: false,
      isTrending: true,
      images: ["https://images.unsplash.com/photo-1588771930296-bf4f9e55d5a8?auto=format&fit=crop&q=80&w=800"],
      categorySlug: "accesorios-barberia",
      type: "PHYSICAL",
    },
    {
      name: "Peine de Cuerno Artesanal",
      description: "Peine fabricado en cuerno natural con dientes anchos y finos. Antiestático y de tracción suave, ideal para cabello y barba. Pieza artesanal única. Recomendado por barberos profesionales.",
      price: 1500,
      stock: 50,
      isNew: false,
      isTrending: false,
      images: ["https://images.unsplash.com/photo-1564859228273-274232fdb516?auto=format&fit=crop&q=80&w=800"],
      categorySlug: "accesorios-barberia",
      type: "PHYSICAL",
    },
    {
      name: "Brocha de Afeitar pelo de Tejón",
      description: "Brocha artesanal de pelo de tejón de alta densidad con mango de madera oscura. Genera una espuma abundante y levanta el pelo para un afeitado más al ras. Se entrega en estuche.",
      price: 4200,
      stock: 20,
      isNew: true,
      isTrending: false,
      images: ["https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=800"],
      categorySlug: "accesorios-barberia",
      type: "PHYSICAL",
    },
    {
      name: "Toalla de Barbero Premium (pack x3)",
      description: "Pack de 3 toallas de barbero en algodón turco de alta absorción. Formato 40x70cm, ideales para aplicaciones de calor y post-afeitado. Resistentes a lavados industriales. Color blanco clásico.",
      price: 2800,
      stock: 40,
      isNew: false,
      isTrending: false,
      images: ["https://images.unsplash.com/photo-1615615228002-890bb61cac6e?auto=format&fit=crop&q=80&w=800"],
      categorySlug: "accesorios-barberia",
      type: "PHYSICAL",
    },
    {
      name: "Recortadora Inalámbrica Profesional",
      description: "Recortadora inalámbrica con motor de alta velocidad, 4 cabezales intercambiables (0.5mm a 3mm) y batería de litio 2000mAh (90 min de autonomía). Con estuche de transporte y aceite de mantenimiento.",
      price: 18500,
      stock: 15,
      isNew: true,
      isTrending: true,
      images: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800"],
      categorySlug: "accesorios-barberia",
      type: "PHYSICAL",
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

    const createdProduct = await prisma.product.create({
      data: {
        tenantId: TENANT_ID,
        name: prod.name,
        description: prod.description,
        basePrice: prod.price,
        brand: "Barber Shop",
        type: prod.type || "PHYSICAL",
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
        code: `BAR-${createdProduct.id}-${Date.now()}`,
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
    console.error("❌ Error en seed:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
