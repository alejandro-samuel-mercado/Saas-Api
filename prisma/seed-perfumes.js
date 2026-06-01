require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ────────────────────────────────────────────────────────
// Seed de Perfumes - Fragancias de muestra
// ────────────────────────────────────────────────────────

async function main() {
  console.log('🌸 Iniciando seed de Perfumes...\n');

  // 1. Obtener el tenant (usamos el primero activo)
  const tenant = await prisma.tenant.findFirst({ where: { status: 'ACTIVE' } });
  if (!tenant) throw new Error('❌ No se encontró un tenant activo. Ejecuta el seed principal primero.');
  console.log(`  🏪 Tenant: ${tenant.name} (${tenant.id})`);

  // 2. Obtener la sucursal principal
  const branch = await prisma.branch.findFirst({
    where: { isHeadquarters: true },
    include: { _count: true }
  }) || await prisma.branch.findFirst();
  if (!branch) throw new Error('❌ No se encontró ninguna sucursal.');
  console.log(`  🏢 Sucursal: ${branch.name} (ID: ${branch.id})\n`);

  // 3. Obtener o crear el rubro perfumes
  let rubro = await prisma.rubro.findUnique({ where: { slug: 'perfumes' } });
  if (!rubro) throw new Error('❌ El rubro "perfumes" no existe. Ejecuta seed-rubros.js primero.');

  // 4. Crear categorías
  console.log('📂 Creando categorías...');
  const categoryData = [
    { name: 'Clásicos y Atemporales', slug: 'clasicos-perfumes', description: 'Fragancias icónicas que han resistido el paso del tiempo' },
    { name: 'Orientales y Amaderados', slug: 'orientales-amaderados', description: 'Esencias cálidas con notas de madera, ámbar y especias' },
    { name: 'Florales y Frescos', slug: 'florales-frescos', description: 'Fragancias ligeras con notas de flores y cítricos' },
    { name: 'Árabes y Oud', slug: 'arabes-oud', description: 'Fragancias intensas con esencias del Medio Oriente' },
  ];

  const categories = {};
  for (const cat of categoryData) {
    const existing = await prisma.category.findFirst({ where: { slug: cat.slug } });
    if (existing) {
      categories[cat.slug] = existing;
      console.log(`  ♻️  Categoría existente: ${cat.name}`);
    } else {
      categories[cat.slug] = await prisma.category.create({ data: cat });
      console.log(`  ✅ Categoría creada: ${cat.name}`);
    }
  }

  // 5. Perfumes de muestra
  const perfumes = [
    {
      name: "Bleu de Chanel",
      brand: "Chanel",
      model: "Bleu Collection",
      description: "Una fragancia aromática y maderada que captura la libertad del espíritu masculino. Notas de cítricos frescos sobre un corazón de jazmín y vetiver amaderado. Un clásico moderno de incalculable elegancia.",
      basePrice: 185000,
      images: [
        "https://images.unsplash.com/photo-1541643600914-78b084683702?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1563170351-be82bc888aa4?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1588776814546-ec7e8a3ed3b0?auto=format&fit=crop&q=80&w=800",
      ],
      categorySlug: "clasicos-perfumes",
      characteristics: [
        { key: "Marca", value: "Chanel" },
        { key: "Línea", value: "Bleu de Chanel" },
        { key: "Género", value: "Masculino" },
        { key: "Origen", value: "Francia" },
        { key: "Estado", value: "Original" },
        { key: "Proveedor", value: "Importadora Premium SA" },
        { key: "Ubicación almacén", value: "Estante A-3" },
      ],
      specifications: [
        { key: "Concentración", value: "EDP - Eau de Parfum" },
        { key: "Volumen", value: "100 ml" },
        { key: "Duración estimada", value: "8-10 horas" },
        { key: "Lote", value: "CH2024-001" },
        { key: "Fecha de Vencimiento", value: "12/2027" },
        { key: "Familia Olfativa", value: "Aromático Amaderado" },
        { key: "Notas de Salida", value: "Limón, Menta, Pomelo" },
        { key: "Notas de Corazón", value: "Jazmín, Jengibre, ISO E Super" },
        { key: "Notas de Fondo", value: "Sándalo, Patchouli, Vetiver" },
      ],
      variants: [
        { label: "50 ml", price: 125000, stock: 8 },
        { label: "100 ml", price: 185000, stock: 5 },
        { label: "150 ml", price: 230000, stock: 3 },
      ],
    },
    {
      name: "Sauvage Dior",
      brand: "Dior",
      model: "Sauvage Collection",
      description: "Inspirado en la majestuosidad de los paisajes desérticos, Sauvage es una fragancia fresca, amaderada y fuerte. Notas de bergamota calabresa, acompañadas de un poderoso Ambroxan salvaje. Una de las fragancias masculinas más icónicas del siglo XXI.",
      basePrice: 195000,
      images: [
        "https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&q=80&w=800",
      ],
      categorySlug: "clasicos-perfumes",
      characteristics: [
        { key: "Marca", value: "Dior" },
        { key: "Línea", value: "Sauvage" },
        { key: "Género", value: "Masculino" },
        { key: "Origen", value: "Francia" },
        { key: "Estado", value: "Original" },
        { key: "Proveedor", value: "Importadora Premium SA" },
        { key: "Ubicación almacén", value: "Estante A-4" },
      ],
      specifications: [
        { key: "Concentración", value: "EDT - Eau de Toilette" },
        { key: "Volumen", value: "100 ml" },
        { key: "Duración estimada", value: "6-8 horas" },
        { key: "Lote", value: "DR2024-020" },
        { key: "Fecha de Vencimiento", value: "06/2027" },
        { key: "Familia Olfativa", value: "Aromático Fresco" },
        { key: "Notas de Salida", value: "Bergamota, Pimienta" },
        { key: "Notas de Corazón", value: "Lavanda, Geranio" },
        { key: "Notas de Fondo", value: "Ambroxan, Cedro, Vetiver" },
      ],
      variants: [
        { label: "60 ml", price: 135000, stock: 10 },
        { label: "100 ml", price: 195000, stock: 7 },
        { label: "200 ml", price: 265000, stock: 2 },
      ],
    },
    {
      name: "La Vie Est Belle",
      brand: "Lancôme",
      model: "La Vie Est Belle",
      description: "La vida es bella. Un manifiesto de felicidad y libertad. Este gourmand floral, creado por tres maestros perfumistas, reúne iris, pralinê y vainilla en una composición que se siente como un abrazo cálido.",
      basePrice: 172000,
      images: [
        "https://images.unsplash.com/photo-1590156206657-aec4e6b68588?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&q=80&w=800",
      ],
      categorySlug: "florales-frescos",
      characteristics: [
        { key: "Marca", value: "Lancôme" },
        { key: "Línea", value: "La Vie Est Belle" },
        { key: "Género", value: "Femenino" },
        { key: "Origen", value: "Francia" },
        { key: "Estado", value: "Original" },
        { key: "Proveedor", value: "BeautyImport SRL" },
        { key: "Ubicación almacén", value: "Estante B-1" },
      ],
      specifications: [
        { key: "Concentración", value: "EDP - Eau de Parfum" },
        { key: "Volumen", value: "75 ml" },
        { key: "Duración estimada", value: "8-12 horas" },
        { key: "Lote", value: "LC2024-112" },
        { key: "Fecha de Vencimiento", value: "03/2028" },
        { key: "Familia Olfativa", value: "Floral Gourmand" },
        { key: "Notas de Salida", value: "Grosella Negra, Pera" },
        { key: "Notas de Corazón", value: "Iris, Jazmín de Sambac" },
        { key: "Notas de Fondo", value: "Pralinê, Patchouli, Vainilla, Sándalo" },
      ],
      variants: [
        { label: "30 ml", price: 95000, stock: 12 },
        { label: "75 ml", price: 172000, stock: 6 },
        { label: "100 ml", price: 210000, stock: 4 },
      ],
    },
    {
      name: "Black Orchid",
      brand: "Tom Ford",
      model: "Black Orchid",
      description: "Una fragancia oscura y opulenta con un corazón de orquídeas negras, exótica y misteriosamente seductora. Especias oscuras, trufas y ylang ylang se mezclan con sándalo negro en una composición verdaderamente singular.",
      basePrice: 320000,
      images: [
        "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&q=80&w=800",
      ],
      categorySlug: "orientales-amaderados",
      characteristics: [
        { key: "Marca", value: "Tom Ford" },
        { key: "Línea", value: "Signature" },
        { key: "Género", value: "Unisex" },
        { key: "Origen", value: "Estados Unidos" },
        { key: "Estado", value: "Original" },
        { key: "Proveedor", value: "Luxury Scents SA" },
        { key: "Ubicación almacén", value: "Estante C-1" },
      ],
      specifications: [
        { key: "Concentración", value: "EDP - Eau de Parfum" },
        { key: "Volumen", value: "50 ml" },
        { key: "Duración estimada", value: "12+ horas" },
        { key: "Lote", value: "TF2024-045" },
        { key: "Fecha de Vencimiento", value: "09/2027" },
        { key: "Familia Olfativa", value: "Floral Oriental" },
        { key: "Notas de Salida", value: "Bergamota, Aceite de Ylang Ylang" },
        { key: "Notas de Corazón", value: "Orquídea Negra, Trufa, Ylang Ylang" },
        { key: "Notas de Fondo", value: "Patchouli, Incienso, Sándalo" },
      ],
      variants: [
        { label: "50 ml", price: 320000, stock: 3 },
        { label: "100 ml", price: 480000, stock: 2 },
      ],
    },
    {
      name: "Oud Wood",
      brand: "Tom Ford",
      model: "Private Blend",
      description: "Oud Wood introduce por primera vez el exótico ingrediente oud en la línea Private Blend. Maderas raras como palo de rosa, sándalo cardamomo y vainilla se combinan con el oud en una fragancia extraordinariamente cálida.",
      basePrice: 380000,
      images: [
        "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800",
      ],
      categorySlug: "arabes-oud",
      characteristics: [
        { key: "Marca", value: "Tom Ford" },
        { key: "Línea", value: "Private Blend" },
        { key: "Género", value: "Unisex" },
        { key: "Origen", value: "Estados Unidos" },
        { key: "Estado", value: "Original" },
        { key: "Proveedor", value: "Luxury Scents SA" },
        { key: "Ubicación almacén", value: "Estante C-2" },
      ],
      specifications: [
        { key: "Concentración", value: "EDP - Eau de Parfum" },
        { key: "Volumen", value: "50 ml" },
        { key: "Duración estimada", value: "15+ horas" },
        { key: "Lote", value: "TF2024-080" },
        { key: "Fecha de Vencimiento", value: "06/2027" },
        { key: "Familia Olfativa", value: "Oriental Amaderado" },
        { key: "Notas de Salida", value: "Palo de Rosa, Cardamomo" },
        { key: "Notas de Corazón", value: "Oud, Sándalo Chino" },
        { key: "Notas de Fondo", value: "Vainilla, Ámbar, Musgo" },
      ],
      variants: [
        { label: "50 ml", price: 380000, stock: 4 },
        { label: "250 ml", price: 1200000, stock: 1 },
      ],
    },
    {
      name: "Coco Mademoiselle",
      brand: "Chanel",
      model: "Coco",
      description: "Una fragancia vibrante y libre, que combina la distinción del estilo Chanel con una chispa inesperada. Naranja fresca, notas de rosa y jazmín, con una base de patchouli y vetiver que otorga profundidad sensual.",
      basePrice: 210000,
      images: [
        "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&q=80&w=800",
      ],
      categorySlug: "florales-frescos",
      characteristics: [
        { key: "Marca", value: "Chanel" },
        { key: "Línea", value: "Coco" },
        { key: "Género", value: "Femenino" },
        { key: "Origen", value: "Francia" },
        { key: "Estado", value: "Original" },
        { key: "Proveedor", value: "Importadora Premium SA" },
        { key: "Ubicación almacén", value: "Estante A-2" },
      ],
      specifications: [
        { key: "Concentración", value: "EDP - Eau de Parfum" },
        { key: "Volumen", value: "100 ml" },
        { key: "Duración estimada", value: "10-12 horas" },
        { key: "Lote", value: "CH2024-060" },
        { key: "Fecha de Vencimiento", value: "08/2028" },
        { key: "Familia Olfativa", value: "Oriental Floral" },
        { key: "Notas de Salida", value: "Naranja, Bergamota" },
        { key: "Notas de Corazón", value: "Rosa Turca, Jazmín de Grasse" },
        { key: "Notas de Fondo", value: "Patchouli, Vetiver, Musgo Blanco" },
      ],
      variants: [
        { label: "35 ml", price: 145000, stock: 9 },
        { label: "100 ml", price: 210000, stock: 5 },
      ],
    },
    {
      name: "Libre de YSL",
      brand: "Yves Saint Laurent",
      model: "Libre",
      description: "Un contraste de lavanda intensa con flores blancas eternas. Libre rinde homenaje a las mujeres de hoy: fuertes, libres y sensuales. La lavanda clásica del perfume masculino se rompe con absoluto de flor de naranja.",
      basePrice: 165000,
      images: [
        "https://images.unsplash.com/photo-1580870069867-74c57ee1bb07?auto=format&fit=crop&q=80&w=800",
      ],
      categorySlug: "florales-frescos",
      characteristics: [
        { key: "Marca", value: "Yves Saint Laurent" },
        { key: "Línea", value: "Libre" },
        { key: "Género", value: "Femenino" },
        { key: "Origen", value: "Francia" },
        { key: "Estado", value: "Original" },
        { key: "Proveedor", value: "BeautyImport SRL" },
        { key: "Ubicación almacén", value: "Estante B-3" },
      ],
      specifications: [
        { key: "Concentración", value: "EDP - Eau de Parfum" },
        { key: "Volumen", value: "90 ml" },
        { key: "Duración estimada", value: "8-10 horas" },
        { key: "Lote", value: "YSL2024-033" },
        { key: "Fecha de Vencimiento", value: "11/2027" },
        { key: "Familia Olfativa", value: "Floral Oriental" },
        { key: "Notas de Salida", value: "Lavanda Francesa, Mandarina" },
        { key: "Notas de Corazón", value: "Flor de Naranja de Marruecos" },
        { key: "Notas de Fondo", value: "Musgo de Roble, Vainilla, Cedro" },
      ],
      variants: [
        { label: "30 ml", price: 95000, stock: 7 },
        { label: "90 ml", price: 165000, stock: 4 },
      ],
    },
    {
      name: "Acqua di Gio",
      brand: "Giorgio Armani",
      model: "Acqua di Giò",
      description: "Una oda al mar, inspirada en la isla de Pantelleria. Fresca como el agua salada del Mediterráneo, con notas marinas que evocan la libertad del viento marino y el calor del sol sobre las rocas.",
      basePrice: 145000,
      images: [
        "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1503236823255-94609f598e71?auto=format&fit=crop&q=80&w=800",
      ],
      categorySlug: "clasicos-perfumes",
      characteristics: [
        { key: "Marca", value: "Giorgio Armani" },
        { key: "Línea", value: "Acqua di Giò" },
        { key: "Género", value: "Masculino" },
        { key: "Origen", value: "Italia" },
        { key: "Estado", value: "Original" },
        { key: "Proveedor", value: "Importadora Premium SA" },
        { key: "Ubicación almacén", value: "Estante A-5" },
      ],
      specifications: [
        { key: "Concentración", value: "EDT - Eau de Toilette" },
        { key: "Volumen", value: "100 ml" },
        { key: "Duración estimada", value: "5-7 horas" },
        { key: "Lote", value: "GA2024-092" },
        { key: "Fecha de Vencimiento", value: "04/2028" },
        { key: "Familia Olfativa", value: "Acuático Fresco" },
        { key: "Notas de Salida", value: "Mar, Bergamota, Lima, Neroli" },
        { key: "Notas de Corazón", value: "Jazmín, Romero, Persimmon" },
        { key: "Notas de Fondo", value: "Cedro, Patchouli, Musgo Blanco" },
      ],
      variants: [
        { label: "50 ml", price: 95000, stock: 15 },
        { label: "100 ml", price: 145000, stock: 8 },
        { label: "200 ml", price: 195000, stock: 3 },
      ],
    },
  ];

  // 6. Crear productos
  console.log('\n🧴 Creando productos...');
  let created = 0, updated = 0, errors = 0;

  for (const p of perfumes) {
    try {
      const category = categories[p.categorySlug];
      if (!category) {
        console.log(`  ⚠️  Categoría "${p.categorySlug}" no encontrada para: ${p.name}`);
        errors++;
        continue;
      }

      const slug = p.name.toLowerCase()
        .replace(/[áàä]/g, 'a').replace(/[éèë]/g, 'e').replace(/[íìï]/g, 'i')
        .replace(/[óòö]/g, 'o').replace(/[úùü]/g, 'u').replace(/ñ/g, 'n')
        .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');

      const existing = await prisma.product.findFirst({ 
        where: { name: p.name, tenantId: tenant.id } 
      });

      const productData = {
        name: p.name,
        brand: p.brand,
        model: p.model,
        description: p.description,
        basePrice: p.basePrice,
        images: p.images,
        categoryId: category.id,
        tenantId: tenant.id,
        rubroId: rubro.id,
        isActive: true,
        isTrending: Math.random() > 0.5,
        isNew: Math.random() > 0.6,
        characteristics: p.characteristics,
        specifications: p.specifications,
        measurementUnit: 'UNIDAD',
        allowFractional: false,
        type: 'SIMPLE',
        saleMode: 'VENTA',
      };

      let product;
      if (existing) {
        product = await prisma.product.update({ where: { id: existing.id }, data: productData });
        console.log(`  ✏️  Actualizado: ${p.name}`);
        updated++;
      } else {
        product = await prisma.product.create({ data: productData });
        console.log(`  ✅ Creado: ${p.name}`);
        created++;
      }

      // Create / update SKUs
      for (const v of p.variants) {
        const skuCode = `${slug}-${v.label.replace(/\s/g, '-').toLowerCase()}`;
        const existingSku = await prisma.sKU.findFirst({ where: { code: skuCode } });

        let sku;
        if (existingSku) {
          sku = await prisma.sKU.update({
            where: { id: existingSku.id },
            data: { price: v.price, stock: v.stock }
          });
        } else {
          sku = await prisma.sKU.create({
            data: {
              productId: product.id,
              code: skuCode,
              price: v.price,
              stock: v.stock,
              costPrice: Math.round(v.price * 0.6),
              tenantId: tenant.id,
              isAutoGenerated: false,
              active: true,
              variantOptions: {
                create: [{ name: 'Volumen', value: v.label }]
              }
            }
          });
        }

        // Branch inventory
        const existingInv = await prisma.branchInventory.findFirst({
          where: { skuId: sku.id, branchId: branch.id }
        });
        if (!existingInv) {
          await prisma.branchInventory.create({
            data: {
              skuId: sku.id,
              branchId: branch.id,
              stock: v.stock,
              minStock: 2,
              price: v.price,
              isActive: true,
            }
          });
        }
      }
    } catch (err) {
      console.error(`  ❌ Error en "${p.name}":`, err.message);
      errors++;
    }
  }

  console.log(`\n📊 Resumen:`);
  console.log(`  ✅ Creados: ${created}`);
  console.log(`  ✏️  Actualizados: ${updated}`);
  console.log(`  ❌ Errores: ${errors}`);
  console.log('\n🌸 Seed de Perfumes finalizado!\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
