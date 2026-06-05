require('dotenv').config();
const prisma = require('../src/config/prisma');

async function main() {
    console.log('Sembrando datos de Decoración y Eventos...');

    // Obtener el primer tenant existente
    let tenant = await prisma.tenant.findFirst();
    if (!tenant) {
        console.error("No se encontró ningún tenant. Crea un tenant base primero.");
        process.exit(1);
    }
    const tenantId = tenant.id;

    // Asegurarse de que exista el rubro
    let rubro = await prisma.rubro.findUnique({ where: { slug: 'decoracion' } });
    if (!rubro) {
        rubro = await prisma.rubro.create({
            data: {
                slug: 'decoracion',
                name: 'Decoración y Eventos',
                icon: 'party-popper',
                storefrontLayout: 'standard',
                cartEnabled: true,
                posEnabled: true,
                disabledModules: [],
                productFormConfig: {
                    showNutritionalInfo: false,
                    showSaleMode: true,
                    variantsSuggested: ['Color', 'Tamaño'],
                    productLabel: 'Artículo',
                    categoryLabel: 'Tipo de Evento',
                    specSuggestions: ['Material', 'Medidas', 'Cantidad por Paquete', 'Reutilizable'],
                    charSuggestions: ['Temática', 'Personalizable'],
                }
            }
        });
    }

    // Configuración Pública
    const existingConfig = await prisma.storeConfig.findFirst({
        where: { tenantId }
    });

    if (existingConfig) {
        await prisma.storeConfig.update({
            where: { id: existingConfig.id },
            data: {
                storeName: 'Fleur Events',
                logoUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=200',
                themeColors: {
                    background: '#F0E5D8',
                    primary: '#E1CDBF',
                    text: '#3A302A'
                },
                adImage: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80',
                adText: 'Free delivery on orders over $79',
            }
        });
    } else {
        await prisma.storeConfig.create({
            data: {
                tenantId,
                storeName: 'Fleur Events',
                logoUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=200',
                themeColors: {
                    background: '#F0E5D8',
                    primary: '#E1CDBF',
                    text: '#3A302A'
                },
                adImage: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80',
                adText: 'Free delivery on orders over $79',
            }
        });
    }

    // Categorías
    const categorias = ['Bodas', 'Cumpleaños', 'Flores Secas', 'Mobiliario'];
    const categoriasCreadas = {};

    for (const cat of categorias) {
        let existingCat = await prisma.category.findFirst({
            where: { name: cat, tenantId }
        });
        if (!existingCat) {
            existingCat = await prisma.category.create({
                data: {
                    name: cat,
                    slug: cat.toLowerCase().replace(/ /g, '-'),
                    tenantId
                }
            });
        }
        categoriasCreadas[cat] = existingCat;
    }

    // Productos
    const productos = [
        {
            name: 'Pampas Grass Bouquet',
            description: 'Elegante bouquet de pampas secas, ideal para centros de mesa o decoración de esquinas.',
            basePrice: 4500,
            saleMode: 'VENTA',
            category: 'Flores Secas',
            images: ['https://images.unsplash.com/photo-1589139316629-87a41951f215?auto=format&fit=crop&q=80&w=800'],
            specifications: { 'Medidas': '120cm', 'Material': 'Natural Seco' }
        },
        {
            name: 'Silla Tiffany Dorada',
            description: 'Silla clásica de eventos. Diseño elegante y apilable.',
            basePrice: 350, // Precio alquiler
            saleMode: 'ALQUILER',
            category: 'Mobiliario',
            images: ['https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800'],
            specifications: { 'Material': 'Resina Dorada', 'Reutilizable': 'Sí' }
        },
        {
            name: 'Arco Floral de Boda',
            description: 'Arco semicircular decorado con rosas y follaje. Incluye instalación.',
            basePrice: 45000,
            saleMode: 'ALQUILER',
            category: 'Bodas',
            images: ['https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800'],
            specifications: { 'Medidas': '2.5m x 2m', 'Personalizable': 'Sí' }
        },
        {
            name: 'Centro de Mesa Geométrico',
            description: 'Terrario geométrico dorado con flores preservadas.',
            basePrice: 8500,
            saleMode: 'VENTA',
            category: 'Bodas',
            images: ['https://images.unsplash.com/photo-1533038590840-1cbea6e6fc1a?auto=format&fit=crop&q=80&w=800'],
            specifications: { 'Material': 'Vidrio y Cobre', 'Medidas': '20cm x 15cm' }
        }
    ];

    for (const p of productos) {
        const cat = categoriasCreadas[p.category];
        await prisma.product.create({
            data: {
                name: p.name,
                description: p.description,
                basePrice: p.basePrice,
                saleMode: p.saleMode,
                tenantId,
                categoryId: cat.id,
                rubroId: rubro.id,
                images: p.images,
                specifications: p.specifications,
                brand: 'Fleur',
                type: 'PHYSICAL'
            }
        });
    }

    console.log('✅ Seed finalizado con éxito.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
