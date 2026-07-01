/**
 * Seed: 20 Productos para Rubro "General" (Tecnología y Electrodomésticos)
 * Tenant: 48758d33-947f-4724-afce-17e13f72730a
 *
 * Ejecución:
 *   cd Saas-Api && node scripts/seed-general.js
 */

const prisma = require("../src/config/prisma");

const TENANT_ID = "48758d33-947f-4724-afce-17e13f72730a";

async function main() {
  console.log(`\n📦 Seeding General tenant: ${TENANT_ID}\n`);

  // ─── 1. Categorías ──────────────────────────────────────────────────────────
  const categoryData = [
    { name: "Tecnología", slug: "tecnologia", description: "Smartphones, tablets, computadoras y accesorios." },
    { name: "Electrodomésticos", slug: "electrodomesticos", description: "Línea blanca, pequeños electrodomésticos y climatización." },
    { name: "Audio y Video", slug: "audio-y-video", description: "Televisores, parlantes, auriculares y sonido profesional." },
    { name: "Hogar Smart", slug: "hogar-smart", description: "Iluminación inteligente, cámaras y asistentes virtuales." },
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
    // Tecnología
    {
      name: "Smartphone Pro Max 256GB",
      description: "Pantalla OLED de 6.7 pulgadas, cámara triple de 48MP, procesador de última generación y batería de larga duración. Disponible en color negro medianoche.",
      price: 1200000,
      stock: 15,
      isNew: true,
      isTrending: true,
      images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800"],
      categorySlug: "tecnologia",
    },
    {
      name: "Notebook Ultraliviana 14\" M2",
      description: "Laptop ultradelgada con procesador M2, 16GB de RAM unificada y 512GB SSD. Perfecta para productividad y diseño on-the-go. Peso: 1.2kg.",
      price: 1550000,
      stock: 10,
      isNew: false,
      isTrending: true,
      images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800"],
      categorySlug: "tecnologia",
    },
    {
      name: "Tablet 11\" Pantalla 2K",
      description: "Ideal para consumo multimedia y dibujo digital. Incluye lápiz óptico de precisión magnético y funda con teclado retroiluminado. Batería para todo el día.",
      price: 650000,
      stock: 25,
      isNew: true,
      isTrending: false,
      images: ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=800"],
      categorySlug: "tecnologia",
    },
    {
      name: "Monitor Curvo 34\" Ultrawide 144Hz",
      description: "Resolución WQHD, tiempo de respuesta de 1ms y tecnología FreeSync. Diseñado para gamers exigentes y creadores de contenido que necesitan máximo espacio de trabajo.",
      price: 890000,
      stock: 8,
      isNew: false,
      isTrending: true,
      images: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800"],
      categorySlug: "tecnologia",
    },
    {
      name: "Mouse Inalámbrico Ergonómico PRO",
      description: "Diseño vertical que reduce la tensión muscular. Sensor de alta precisión 16000 DPI, batería recargable por USB-C y conexión multi-dispositivo.",
      price: 125000,
      stock: 40,
      isNew: false,
      isTrending: false,
      images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=800"],
      categorySlug: "tecnologia",
    },

    // Electrodomésticos
    {
      name: "Cafetera Expresso Automática",
      description: "Bomba italiana de 19 bares, espumador de leche integrado y molinillo cerámico para granos de café frescos. Prepara espresso, cappuccino y latte macchiato con un toque.",
      price: 450000,
      stock: 12,
      isNew: true,
      isTrending: true,
      images: ["https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&q=80&w=800"],
      categorySlug: "electrodomesticos",
    },
    {
      name: "Licuadora de Alta Potencia 1500W",
      description: "Motor profesional capaz de triturar hielo en segundos. Jarra de Tritan libre de BPA de 2 litros, programas automáticos para smoothies, sopas calientes y postres helados.",
      price: 185000,
      stock: 20,
      isNew: false,
      isTrending: false,
      images: ["https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&q=80&w=800"],
      categorySlug: "electrodomesticos",
    },
    {
      name: "Robot Aspirador con Mapeo Láser",
      description: "Aspiradora y mopa simultánea. Navegación inteligente LiDAR, control total desde la app móvil, y compatibilidad con asistentes de voz. Autonomía de 150 minutos.",
      price: 680000,
      stock: 15,
      isNew: true,
      isTrending: true,
      images: ["https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=800"],
      categorySlug: "electrodomesticos",
    },
    {
      name: "Freidora de Aire Digital 5.5L",
      description: "Cocina sin aceite con tecnología de circulación de aire 360°. Panel táctil con 8 programas preestablecidos, cesta antiadherente extraíble apta para lavavajillas.",
      price: 210000,
      stock: 35,
      isNew: false,
      isTrending: true,
      images: ["https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=80&w=800"],
      categorySlug: "electrodomesticos",
    },
    {
      name: "Purificador de Aire HEPA H13",
      description: "Elimina el 99.97% de partículas, polvo, polen y olores. Sensor de calidad del aire en tiempo real, modo nocturno ultrasilencioso y cobertura para habitaciones de hasta 45m2.",
      price: 195000,
      stock: 18,
      isNew: true,
      isTrending: false,
      images: ["https://images.unsplash.com/photo-1584883100657-f58c7414bc5c?auto=format&fit=crop&q=80&w=800"],
      categorySlug: "electrodomesticos",
    },

    // Audio y Video
    {
      name: "Smart TV 65\" 4K QLED",
      description: "Experiencia cinematográfica con colores Quantum Dot, procesador de IA y sistema de sonido inmersivo Dolby Atmos. Biseles ultradelgados y control remoto por voz.",
      price: 1450000,
      stock: 8,
      isNew: false,
      isTrending: true,
      images: ["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=800"],
      categorySlug: "audio-y-video",
    },
    {
      name: "Auriculares Inalámbricos Noise Cancelling",
      description: "Cancelación de ruido activa líder en la industria, audio de alta resolución y hasta 30 horas de autonomía. Diseño circumaural cómodo para uso prolongado.",
      price: 350000,
      stock: 30,
      isNew: true,
      isTrending: true,
      images: ["https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800"],
      categorySlug: "audio-y-video",
    },
    {
      name: "Barra de Sonido 3.1 Bluetooth",
      description: "Mejora el audio de tu TV con 300W de potencia, subwoofer inalámbrico y conectividad HDMI ARC. Perfiles de sonido ecualizados para películas, música y noticias.",
      price: 290000,
      stock: 15,
      isNew: false,
      isTrending: false,
      images: ["https://images.unsplash.com/photo-1545454675-a6a61fa34c11?auto=format&fit=crop&q=80&w=800"],
      categorySlug: "audio-y-video",
    },
    {
      name: "Parlante Portátil Waterproof",
      description: "Sonido envolvente 360°, resistencia al agua y polvo IP67, flotable y con 12 horas de batería. El compañero ideal para aventuras al aire libre y pileta.",
      price: 145000,
      stock: 45,
      isNew: false,
      isTrending: true,
      images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=800"],
      categorySlug: "audio-y-video",
    },
    {
      name: "Auriculares TWS Deportivos",
      description: "True Wireless Stereo con ganchos ajustables de silicona para ajuste seguro durante el entrenamiento. Resistentes al sudor, bajos profundos y 8 horas de batería por carga.",
      price: 85000,
      stock: 50,
      isNew: true,
      isTrending: false,
      images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800"],
      categorySlug: "audio-y-video",
    },

    // Hogar Smart
    {
      name: "Cámara de Seguridad WiFi Exterior",
      description: "Resolución 1080p, visión nocturna a color, detección de movimiento con IA y sirena integrada. Soporta clima extremo y graba en nube o tarjeta SD.",
      price: 110000,
      stock: 25,
      isNew: false,
      isTrending: true,
      images: ["https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?auto=format&fit=crop&q=80&w=800"],
      categorySlug: "hogar-smart",
    },
    {
      name: "Asistente Virtual con Pantalla 7\"",
      description: "Controla tu hogar inteligente, mira videos, realiza videollamadas y organiza tu agenda usando solo tu voz. Centro de control doméstico integral.",
      price: 175000,
      stock: 12,
      isNew: true,
      isTrending: false,
      images: ["https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&q=80&w=800"],
      categorySlug: "hogar-smart",
    },
    {
      name: "Pack x3 Focos LED Inteligentes RGB",
      description: "Iluminación multicolor controlable desde el celular o por voz. Ajuste de temperatura, rutinas programables y sincronización con música. No requiere hub.",
      price: 65000,
      stock: 60,
      isNew: false,
      isTrending: true,
      images: ["https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800"],
      categorySlug: "hogar-smart",
    },
    {
      name: "Cerradura Inteligente Biométrica",
      description: "Apertura mediante huella dactilar, código PIN, tarjeta RFID o app móvil. Registro de accesos en tiempo real y teclado táctil retroiluminado. Máxima seguridad para tu puerta.",
      price: 320000,
      stock: 8,
      isNew: true,
      isTrending: true,
      images: ["https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=800"],
      categorySlug: "hogar-smart",
    },
    {
      name: "Termostato Inteligente WiFi",
      description: "Aprende tus rutinas de temperatura para ahorrar energía. Control a distancia de calefacción y aire acondicionado. Pantalla táctil minimalista y sensores de humedad.",
      price: 240000,
      stock: 10,
      isNew: false,
      isTrending: false,
      images: ["https://images.unsplash.com/photo-1584824388147-752179836371?auto=format&fit=crop&q=80&w=800"],
      categorySlug: "hogar-smart",
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
        brand: "TechBrand",
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
        code: `GEN-${createdProduct.id}-${Date.now()}`,
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
