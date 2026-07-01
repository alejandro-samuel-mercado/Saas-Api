// seed-inmuebles.js
// Run: node prisma/seed-inmuebles.js

const prisma = require("../src/config/prisma");

const TENANT_ID = process.env.SEED_TENANT_ID || "2773088c-8b66-47ee-a9a6-b5c6daf95de0";

const images = {
    casas: [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=1200"
    ],
    departamentos: [
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1502672260266-1c1de2d93688?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=1200"
    ],
    terrenos: [
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1629196914275-eb2b638b9758?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1589139611295-a4b0dcf18471?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1629196914275-eb2b638b9758?auto=format&fit=crop&q=80&w=1200"
    ],
    oficinas: [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=1200"
    ]
};

async function main() {
    console.log(`\n🏡 Seeding Inmuebles rubro for tenantId: ${TENANT_ID}\n`);

    // ── 1. RUBRO ──────────────────────────────────────────────────────────────
    const rubro = await prisma.rubro.upsert({
        where: { slug: "inmuebles" },
        update: {},
        create: {
            name: "Inmuebles y Desarrollos",
            slug: "inmuebles",
            cartEnabled: false,
            productFormConfig: {
                productLabel: "Inmueble",
                showSaleMode: true,
                hideBrand: true,
                fields: [
                    "nombre", "tipo", "operacion", "ubicacion", "ambientes",
                    "dormitorios", "baños", "metros_totales", "metros_cubiertos",
                    "cochera", "antiguedad", "expensas", "precio", "galeria", "video"
                ]
            }
        },
    });
    console.log(`✅ Rubro: ${rubro.name} (id: ${rubro.id})`);

    // ── 2. CATEGORIES ─────────────────────────────────────────────────────────
    const categoryData = [
        { name: "Casas", slug: `casas-${TENANT_ID}`, description: "Residencias y Casas de Lujo" },
        { name: "Departamentos", slug: `departamentos-${TENANT_ID}`, description: "Pisos y Semipisos Premium" },
        { name: "Terrenos", slug: `terrenos-${TENANT_ID}`, description: "Lotes en barrios cerrados y campos" },
        { name: "Oficinas", slug: `oficinas-${TENANT_ID}`, description: "Espacios corporativos" },
    ];

    const categories = {};
    for (const cat of categoryData) {
        const created = await prisma.category.upsert({
            where: { tenantId_slug: { tenantId: TENANT_ID, slug: cat.slug } },
            update: { name: cat.name },
            create: { ...cat, tenantId: TENANT_ID },
        });
        categories[cat.slug] = created;
    }

    const getCat = (slugKey) => categories[`${slugKey}-${TENANT_ID}`]?.id;

    // ── 3. PRODUCTS ───────────────────────────────────────────────────────────
    const products = [];

    // Generate 5 Casas
    for(let i=0; i<5; i++) {
        products.push({
            name: `Residencia Premium Nordelta ${i+1}`,
            description: `Exclusiva casa en Barrio Los Castores con vista al lago. Desarrollada en 2 plantas con materiales de primera calidad y diseño moderno.`,
            type: "Casa",
            categorySlug: `casas-${TENANT_ID}`,
            basePrice: 850000 + (i * 50000),
            images: [images.casas[i], images.casas[(i+1)%5]],
            isTrending: i < 2,
            isNew: i > 2,
            saleMode: i % 2 === 0 ? "VENTA" : "ALQUILER",
            characteristics: [
                { key: "Ubicación", value: "Nordelta, Buenos Aires" },
                { key: "Ambientes", value: (5 + i).toString() },
                { key: "Dormitorios", value: (3 + (i%2)).toString() },
                { key: "Baños", value: "4" },
                { key: "Metros Totales", value: (800 + (i*50)).toString() + " m2" },
                { key: "Metros Cubiertos", value: (350 + (i*20)).toString() + " m2" },
                { key: "Cochera", value: "Sí (2 Autos)" },
                { key: "Antigüedad", value: i % 2 === 0 ? "A estrenar" : "5 años" },
            ]
        });
    }

    // Generate 5 Departamentos
    for(let i=0; i<5; i++) {
        products.push({
            name: `Penthouse Puerto Madero ${i+1}`,
            description: `Piso exclusivo en torre de categoría con amenities completos. Vista panorámica al río y a la reserva ecológica.`,
            type: "Departamento",
            categorySlug: `departamentos-${TENANT_ID}`,
            basePrice: 1200000 + (i * 100000),
            images: [images.departamentos[i], images.departamentos[(i+1)%5]],
            isTrending: i < 2,
            isNew: true,
            saleMode: "VENTA",
            characteristics: [
                { key: "Ubicación", value: "Puerto Madero, CABA" },
                { key: "Ambientes", value: (4 + (i%2)).toString() },
                { key: "Dormitorios", value: "3" },
                { key: "Baños", value: "3" },
                { key: "Metros Totales", value: (200 + (i*30)).toString() + " m2" },
                { key: "Metros Cubiertos", value: (180 + (i*30)).toString() + " m2" },
                { key: "Cochera", value: "Sí (3 Autos)" },
                { key: "Antigüedad", value: "A estrenar" },
                { key: "Expensas", value: "$250.000" },
            ]
        });
    }

    // Generate 5 Terrenos
    for(let i=0; i<5; i++) {
        products.push({
            name: `Lote Perimetral Pilar Golf ${i+1}`,
            description: `Excelente lote con fondo al green del hoyo 18. Orientación Norte. Ideal para construcción inmediata.`,
            type: "Terreno",
            categorySlug: `terrenos-${TENANT_ID}`,
            basePrice: 150000 + (i * 10000),
            images: [images.terrenos[i]],
            isTrending: false,
            isNew: i < 3,
            saleMode: "VENTA",
            characteristics: [
                { key: "Ubicación", value: "Pilar, Buenos Aires" },
                { key: "Metros Totales", value: (1000 + (i*100)).toString() + " m2" },
                { key: "Fondo", value: "Golf" },
                { key: "Expensas", value: "$85.000" },
            ]
        });
    }

    // Generate 5 Oficinas
    for(let i=0; i<5; i++) {
        products.push({
            name: `Planta Corporativa Catalinas ${i+1}`,
            description: `Piso entero corporativo tipo A. Planta libre con pisoducto, cielorraso desmontable y sistema VRV. Seguridad 24hs.`,
            type: "Oficina",
            categorySlug: `oficinas-${TENANT_ID}`,
            basePrice: 15000 + (i * 1000),
            images: [images.oficinas[i], images.oficinas[(i+1)%5]],
            isTrending: i === 0,
            isNew: false,
            saleMode: "ALQUILER",
            characteristics: [
                { key: "Ubicación", value: "Retiro, CABA" },
                { key: "Metros Totales", value: (400 + (i*50)).toString() + " m2" },
                { key: "Metros Cubiertos", value: (400 + (i*50)).toString() + " m2" },
                { key: "Baños", value: "Batería H/M" },
                { key: "Cochera", value: "Sí (4 Autos)" },
                { key: "Antigüedad", value: "10 años" },
                { key: "Expensas", value: "$300.000" },
            ]
        });
    }

    let createdCount = 0;
    for (const p of products) {
        const catKey = p.categorySlug;
        const cat = categories[catKey];
        if (!cat) continue;

        const branch = await prisma.branch.findFirst({ where: { tenantId: TENANT_ID } });

        const product = await prisma.product.create({
            data: {
                name: p.name,
                description: p.description,
                brand: p.brand || "Desarrolladora",
                model: p.model || "Único",
                type: p.type,
                categoryId: cat.id,
                tenantId: TENANT_ID,
                basePrice: p.basePrice,
                images: p.images,
                isTrending: p.isTrending,
                isNew: p.isNew,
                isActive: true,
                saleMode: p.saleMode,
                characteristics: p.characteristics,
                specifications: p.specifications || [],
                condition: "NEW",
                measurementUnit: "UNIDAD",
                skus: {
                    create: [{
                        code: `INM-${Date.now()}-${createdCount}`,
                        price: p.basePrice,
                        stock: 1,
                        active: true,
                        tenantId: TENANT_ID,
                        ...(branch && {
                            branchInventory: {
                                create: [{
                                    branchId: branch.id,
                                    stock: 1,
                                    minStock: 0,
                                    maxStock: 1,
                                    price: p.basePrice
                                }]
                            }
                        })
                    }]
                }
            },
        });
        createdCount++;
        console.log(`✅ Propiedad: ${product.name}`);
    }

    console.log(`\n🎉 Seed completado! 20 Inmuebles creados.\n`);
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
