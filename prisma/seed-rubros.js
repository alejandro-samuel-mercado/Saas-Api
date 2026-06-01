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

const rubros = [
  {
    slug: 'general',
    name: 'General / Electrodomésticos y Tecnología',
    icon: 'monitor',
    disabledModules: [],
    cartEnabled: true,
    posEnabled: true,
    storefrontLayout: 'standard',
    productFormConfig: {
      showNutritionalInfo: false,
      showSaleMode: false,
      variantsSuggested: [],
      productLabel: 'Producto',
      categoryLabel: 'Categoría',
    },
  },
  {
    slug: 'perfumes',
    name: 'Perfumes y Fragancias',
    icon: 'sparkles',
    disabledModules: [],
    cartEnabled: true,
    posEnabled: true,
    storefrontLayout: 'perfume',
    productFormConfig: {
      showNutritionalInfo: false,
      showSaleMode: false,
      hideBrand: false,
      variantsSuggested: ['Volumen (ml)'],
      productLabel: 'Fragancia',
      categoryLabel: 'Tipo de Fragancia',
      specSuggestions: [
        'Concentración (EDT/EDP)',
        'Volumen (ml)',
        'Duración',
        'Lote',
        'Fecha de Vencimiento',
        'Familia Olfativa',
        'Notas de Salida',
        'Notas de Corazón',
        'Notas de Fondo',
        'Tipo de Fragancia',
      ],
      charSuggestions: [
        'Marca',
        'Línea',
        'Género',
        'Origen',
        'Estado (Original/Alternativo)',
        'Etiquetas',
        'Proveedor',
        'Ubicación almacén',
      ],
    },
  },
  {
    slug: 'relojes',
    name: 'Relojes y Accesorios',
    icon: 'watch',
    disabledModules: [],
    cartEnabled: true,
    posEnabled: true,
    storefrontLayout: 'standard',
    productFormConfig: {
      showNutritionalInfo: false,
      showSaleMode: false,
      variantsSuggested: ['Color', 'Material Correa'],
      productLabel: 'Reloj / Accesorio',
      categoryLabel: 'Tipo',
      specSuggestions: ['Movimiento', 'Material Caja', 'Material Cristal', 'Resistencia al Agua'],
      charSuggestions: ['Número de Serie', 'Referencia', 'Garantía', 'Incluye Caja Original'],
    },
  },
  {
    slug: 'barberias',
    name: 'Barberías y Salones',
    icon: 'scissors',
    disabledModules: [],
    cartEnabled: true,
    posEnabled: true,
    storefrontLayout: 'standard',
    productFormConfig: {
      showNutritionalInfo: false,
      showSaleMode: false,
      variantsSuggested: ['Tamaño', 'Color'],
      productLabel: 'Artículo / Servicio',
      categoryLabel: 'Categoría',
      specSuggestions: ['Voltaje', 'Potencia', 'Registro Sanitario', 'Contenido'],
      charSuggestions: ['Uso', 'Origen', 'Material'],
    },
  },
  {
    slug: 'mascotas',
    name: 'Artículos para Mascotas',
    icon: 'paw-print',
    disabledModules: [],
    cartEnabled: true,
    posEnabled: true,
    storefrontLayout: 'standard',
    productFormConfig: {
      showNutritionalInfo: true,
      showSaleMode: false,
      variantsSuggested: ['Tamaño', 'Sabor'],
      productLabel: 'Producto',
      categoryLabel: 'Categoría',
      specSuggestions: ['Tipo de Mascota', 'Etapa de Vida', 'Tamaño/Raza', 'Fecha Vencimiento'],
      charSuggestions: ['Marca', 'Ingredientes', 'Beneficios'],
    },
  },
  {
    slug: 'decoracion',
    name: 'Decoración y Eventos',
    icon: 'party-popper',
    disabledModules: [],
    cartEnabled: true,
    posEnabled: true,
    storefrontLayout: 'standard',
    productFormConfig: {
      showNutritionalInfo: false,
      showSaleMode: true,
      variantsSuggested: ['Color', 'Tamaño'],
      productLabel: 'Artículo',
      categoryLabel: 'Tipo de Evento',
      specSuggestions: ['Material', 'Medidas', 'Cantidad por Paquete', 'Reutilizable'],
      charSuggestions: ['Temática', 'Personalizable'],
    },
  },
  {
    slug: 'ropa',
    name: 'Ropa y Accesorios',
    icon: 'shirt',
    disabledModules: [],
    cartEnabled: true,
    posEnabled: true,
    storefrontLayout: 'standard',
    productFormConfig: {
      showNutritionalInfo: false,
      showSaleMode: false,
      variantsSuggested: ['Talla', 'Color'],
      productLabel: 'Prenda / Accesorio',
      categoryLabel: 'Categoría',
      specSuggestions: ['Material', 'Composición', 'Cuidados'],
      charSuggestions: ['Temporada', 'Género', 'Estilo'],
    },
  },
  {
    slug: 'inmuebles',
    name: 'Inmuebles, Terrenos y Lotes',
    icon: 'building-2',
    disabledModules: ['purchases', 'suppliers', 'stock-control', 'stock-transfers', 'coupons', 'expenses'],
    cartEnabled: false,
    posEnabled: false,
    storefrontLayout: 'property',
    productFormConfig: {
      showNutritionalInfo: false,
      showSaleMode: true,
      variantsSuggested: [],
      productLabel: 'Propiedad',
      categoryLabel: 'Tipo de Propiedad',
      specSuggestions: ['Área Total (m²)', 'Área Construida (m²)', 'Frente x Fondo', 'Dormitorios', 'Baños'],
      charSuggestions: ['Zona/Barrio', 'Estado Legal', 'Servicios', 'Uso de Suelo'],
    },
  },
];

async function main() {
  console.log('🏪 Sembrando rubros...');
  for (const rubro of rubros) {
    const existing = await prisma.rubro.findUnique({ where: { slug: rubro.slug } });
    if (existing) {
      await prisma.rubro.update({ where: { slug: rubro.slug }, data: rubro });
      console.log(`  ✏️  Actualizado: ${rubro.name}`);
    } else {
      await prisma.rubro.create({ data: rubro });
      console.log(`  ✅ Creado: ${rubro.name}`);
    }
  }
  console.log('✔️  Rubros listos.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
