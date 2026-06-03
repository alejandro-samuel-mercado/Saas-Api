// seed-relojes.js
// Run: node prisma/seed-relojes.js
// Creates rubro "relojes", categories and 6 demo watch products

const prisma = require("../src/config/prisma");

const TENANT_ID = process.env.SEED_TENANT_ID || "default";

async function main() {
    console.log(`\n🕐 Seeding Relojes rubro for tenantId: ${TENANT_ID}\n`);

    // ── 1. RUBRO ──────────────────────────────────────────────────────────────
    const rubro = await prisma.rubro.upsert({
        where: { slug: "relojes" },
        update: {},
        create: {
            name: "Relojes y Accesorios",
            slug: "relojes",
            cartEnabled: true,
            productFormConfig: {
                productLabel: "Reloj",
                showSaleMode: false,
                hideBrand: false,
                fields: [
                    "nombre", "marca", "linea", "tipo", "uso", "estado",
                    "garantia", "numero_referencia", "material_caja",
                    "material_correa", "cristal", "movimiento", "funciones",
                    "resistencia_agua", "color", "peso",
                    "incluye_caja", "incluye_manual", "incluye_certificado",
                    "certificado_pdf", "precio", "negociable", "costo", "stock",
                    "galeria", "video"
                ]
            }
        },
    });
    console.log(`✅ Rubro: ${rubro.name} (id: ${rubro.id})`);

    // ── 2. CATEGORIES ─────────────────────────────────────────────────────────
    const categoryData = [
        { name: "Relojes de Lujo", slug: `relojes-lujo-${TENANT_ID}`, description: "Alta relojería suiza y europea" },
        { name: "Relojes Sport", slug: `relojes-sport-${TENANT_ID}`, description: "Relojes deportivos y de aventura" },
        { name: "Smartwatch", slug: `smartwatch-${TENANT_ID}`, description: "Relojes inteligentes y wearables" },
        { name: "Accesorios", slug: `accesorios-reloj-${TENANT_ID}`, description: "Mallas, correas y accesorios" },
        { name: "Colección", slug: `relojes-coleccion-${TENANT_ID}`, description: "Piezas de colección y vintage" },
    ];

    const categories = {};
    for (const cat of categoryData) {
        const created = await prisma.category.upsert({
            where: { slug: cat.slug },
            update: { name: cat.name },
            create: { ...cat, tenantId: TENANT_ID },
        });
        categories[cat.slug] = created;
        console.log(`✅ Category: ${created.name} (slug: ${created.slug})`);
    }

    // Helper to get category id
    const getCat = (slugKey) => categories[`${slugKey}-${TENANT_ID}`]?.id;

    // ── 3. PRODUCTS ───────────────────────────────────────────────────────────
    const products = [
        {
            name: "Rolex Submariner Date",
            description: "Icónico reloj de buceo con bisel de cerámica negra y esfera lacada negra. Referencia 126610LN. Pieza en estado impecable con todos sus accesorios originales.",
            brand: "Rolex",
            model: "126610LN",
            type: "Reloj de Buceo",
            categorySlug: `relojes-lujo-${TENANT_ID}`,
            basePrice: 12500000,
            skuPrice: 12500000,
            stock: 1,
            images: [
                "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=800",
            ],
            isTrending: true,
            isNew: false,
            characteristics: [
                { key: "movimiento", value: "Automático Calibre 3235" },
                { key: "material caja", value: "Acero Oystersteel 41mm" },
                { key: "material correa", value: "Oyster Bracelet Acero" },
                { key: "cristal", value: "Zafiro con revestimiento antirreflejo" },
                { key: "resistencia agua", value: "300m / 30 ATM" },
                { key: "funciones", value: "Horas, Minutos, Segundos, Fecha, Bisel Giratorio" },
                { key: "color", value: "Esfera Negra / Bisel Negro" },
                { key: "peso", value: "155g" },
                { key: "estado", value: "Usado - Excelente" },
                { key: "uso", value: "Buceo / Diario" },
                { key: "garantía", value: "2 años tienda" },
                { key: "negociable", value: "No" },
            ],
            specifications: [
                { key: "incluye caja", value: "Sí - Caja original Rolex" },
                { key: "incluye manual", value: "Sí" },
                { key: "incluye certificado", value: "Sí - Tarjeta garantía original" },
                { key: "número de referencia", value: "126610LN" },
            ],
        },
        {
            name: "TAG Heuer Carrera Chronograph",
            description: "Reloj cronógrafo de alta precisión inspirado en las carreras de Fórmula 1. Movimiento Heuer 02 con reserva de marcha de 80 horas.",
            brand: "TAG Heuer",
            model: "CBN2A1B.BA0643",
            type: "Cronógrafo",
            categorySlug: `relojes-lujo-${TENANT_ID}`,
            basePrice: 4800000,
            skuPrice: 4800000,
            stock: 2,
            images: [
                "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800",
            ],
            isTrending: true,
            isNew: true,
            characteristics: [
                { key: "movimiento", value: "Automático Heuer 02 COSC" },
                { key: "material caja", value: "Acero inoxidable 42mm" },
                { key: "material correa", value: "Cuero negro / Acero" },
                { key: "cristal", value: "Zafiro antirreflejo" },
                { key: "resistencia agua", value: "100m / 10 ATM" },
                { key: "funciones", value: "Cronógrafo, Fecha, Taquímetro" },
                { key: "color", value: "Esfera Negra" },
                { key: "peso", value: "145g" },
                { key: "estado", value: "Nuevo" },
                { key: "uso", value: "Sport / Formal" },
                { key: "garantía", value: "2 años TAG Heuer oficial" },
            ],
            specifications: [
                { key: "incluye caja", value: "Sí" },
                { key: "incluye manual", value: "Sí" },
                { key: "incluye certificado", value: "Sí" },
            ],
        },
        {
            name: "Apple Watch Ultra 2",
            description: "Smartwatch de alta performance diseñado para deportes extremos. Caja de titanio, GPS de doble frecuencia y hasta 60h de batería en modo bajo consumo.",
            brand: "Apple",
            model: "MQDY3LL/A",
            type: "Smartwatch",
            categorySlug: `smartwatch-${TENANT_ID}`,
            basePrice: 1800000,
            skuPrice: 1800000,
            stock: 5,
            images: [
                "https://images.unsplash.com/photo-1544117519-31a4b719223d?auto=format&fit=crop&q=80&w=800",
            ],
            isTrending: false,
            isNew: true,
            characteristics: [
                { key: "movimiento", value: "Chip Apple S9 (electrónico)" },
                { key: "material caja", value: "Titanio Aeroespacial 49mm" },
                { key: "material correa", value: "Trail Loop Alpine" },
                { key: "cristal", value: "Zafiro plano" },
                { key: "resistencia agua", value: "100m / EN 13319" },
                { key: "funciones", value: "GPS dual, ECG, SpO2, Altímetro, Brújula, Linterna" },
                { key: "color", value: "Titanio Natural / Azul" },
                { key: "peso", value: "61.4g" },
                { key: "estado", value: "Nuevo" },
                { key: "uso", value: "Deportivo / Aventura" },
                { key: "garantía", value: "1 año Apple" },
            ],
            specifications: [
                { key: "incluye caja", value: "Sí" },
                { key: "incluye manual", value: "Sí" },
                { key: "incluye certificado", value: "No aplica" },
            ],
        },
        {
            name: "Seiko Prospex SPB313",
            description: "Reloj de buceo de la línea Save the Ocean con diseño inspirado en la tortuga marina. Movimiento automático 6R35 con reserva de 70 horas.",
            brand: "Seiko",
            model: "SPB313J1",
            type: "Reloj de Buceo",
            categorySlug: `relojes-sport-${TENANT_ID}`,
            basePrice: 890000,
            skuPrice: 890000,
            stock: 3,
            images: [
                "https://images.unsplash.com/photo-1619134778706-7015533a6150?auto=format&fit=crop&q=80&w=800",
            ],
            isTrending: false,
            isNew: true,
            characteristics: [
                { key: "movimiento", value: "Automático Seiko 6R35" },
                { key: "material caja", value: "Acero inoxidable 45mm" },
                { key: "material correa", value: "Silicona / Nylon" },
                { key: "cristal", value: "Hardlex con capa antirreflejo" },
                { key: "resistencia agua", value: "200m / 20 ATM" },
                { key: "funciones", value: "Horas, Minutos, Segundos, Fecha, Bisel ISO 6425" },
                { key: "color", value: "Esfera Verde / Bisel Negro" },
                { key: "peso", value: "132g" },
                { key: "estado", value: "Nuevo" },
                { key: "uso", value: "Buceo / Outdoor" },
                { key: "garantía", value: "1 año Seiko" },
            ],
            specifications: [
                { key: "incluye caja", value: "Sí" },
                { key: "incluye manual", value: "Sí" },
                { key: "incluye certificado", value: "Sí" },
            ],
        },
        {
            name: "Omega Speedmaster Moonwatch",
            description: "El reloj de la Luna. Referencia Professional Co-Axial Master Chronometer usado por la NASA. Pieza de colección con historia.",
            brand: "Omega",
            model: "310.30.42.50.01.001",
            type: "Cronógrafo",
            categorySlug: `relojes-coleccion-${TENANT_ID}`,
            basePrice: 7200000,
            skuPrice: 7200000,
            stock: 1,
            images: [
                "https://images.unsplash.com/photo-1615655114865-4cc3b781c7c9?auto=format&fit=crop&q=80&w=800",
            ],
            isTrending: true,
            isNew: false,
            characteristics: [
                { key: "movimiento", value: "Manual Omega Calibre 321" },
                { key: "material caja", value: "Acero inoxidable 42mm" },
                { key: "material correa", value: "Correa NASA Velcro / Acero Bracelet" },
                { key: "cristal", value: "Hesalita (Plexiglás)" },
                { key: "resistencia agua", value: "50m / 5 ATM" },
                { key: "funciones", value: "Cronógrafo, Taquímetro, Escala de Pulsaciones" },
                { key: "color", value: "Esfera Negra / Índices Blancos" },
                { key: "peso", value: "140g" },
                { key: "estado", value: "Colección - Excelente" },
                { key: "uso", value: "Colección / Formal" },
                { key: "garantía", value: "2 años tienda" },
                { key: "negociable", value: "Sí" },
            ],
            specifications: [
                { key: "incluye caja", value: "Sí - Caja original Omega" },
                { key: "incluye manual", value: "Sí" },
                { key: "incluye certificado", value: "Sí - Certificado de autenticidad" },
                { key: "número de referencia", value: "310.30.42.50.01.001" },
            ],
        },
        {
            name: "Correa NATO para 20mm",
            description: "Pack de 3 correas NATO de nylon premium para relojes con pasador de 20mm. Disponibles en negro, azul marino y verde oliva.",
            brand: "Generic",
            model: "NATO-20MM",
            type: "Accesorio",
            categorySlug: `accesorios-reloj-${TENANT_ID}`,
            basePrice: 12000,
            skuPrice: 12000,
            stock: 50,
            images: [
                "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?auto=format&fit=crop&q=80&w=800",
            ],
            isTrending: false,
            isNew: true,
            characteristics: [
                { key: "material correa", value: "Nylon balístico 100% poliéster" },
                { key: "color", value: "Negro / Azul Marino / Verde Oliva" },
                { key: "peso", value: "18g" },
                { key: "estado", value: "Nuevo" },
                { key: "uso", value: "Universal 20mm" },
                { key: "garantía", value: "3 meses" },
            ],
            specifications: [
                { key: "incluye caja", value: "Sí - Sobre premium" },
                { key: "incluye manual", value: "No aplica" },
                { key: "incluye certificado", value: "No aplica" },
            ],
        },
    ];

    for (const p of products) {
        const categoryId = getCat(p.categorySlug.replace(`-${TENANT_ID}`, "").replace("relojes-lujo", "relojes-lujo").replace("relojes-sport", "relojes-sport").replace("smartwatch", "smartwatch").replace("accesorios-reloj", "accesorios-reloj").replace("relojes-coleccion", "relojes-coleccion"));

        // Get the correct category by slug
        const catKey = p.categorySlug;
        const cat = categories[catKey];
        if (!cat) {
            console.warn(`⚠️  Category not found for slug: ${catKey} — skipping product ${p.name}`);
            continue;
        }

        const product = await prisma.product.create({
            data: {
                name: p.name,
                description: p.description,
                brand: p.brand,
                model: p.model,
                type: p.type || "Reloj",
                categoryId: cat.id,
                rubroId: rubro.id,
                tenantId: TENANT_ID,
                basePrice: p.basePrice,
                images: p.images,
                isTrending: p.isTrending || false,
                isNew: p.isNew || false,
                isActive: true,
                characteristics: p.characteristics || [],
                specifications: p.specifications || [],
                condition: "NEW",
                measurementUnit: "UNIDAD",
                skus: {
                    create: [{
                        code: `${p.model}-${TENANT_ID}-${Date.now()}`,
                        price: p.skuPrice,
                        stock: p.stock,
                        active: true,
                        tenantId: TENANT_ID,
                        branchInventory: {
                            create: [{
                                branchId: 14, // Assuming 14 or handle dynamically in real use
                                stock: p.stock,
                                minStock: 1,
                                maxStock: 100,
                                price: p.skuPrice
                            }]
                        }
                    }]
                }
            },
        });
        console.log(`✅ Product: ${product.name} ($${p.basePrice.toLocaleString()})`);
    }

    console.log(`\n🎉 Seed completado! Rubro "Relojes y Accesorios" listo.\n`);
    console.log(`📋 Próximos pasos:`);
    console.log(`   1. Ir al panel admin → Configuración → Rubro`);
    console.log(`   2. Seleccionar "Relojes y Accesorios" como rubro activo`);
    console.log(`   3. Guardar y refrescar el storefront\n`);
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
