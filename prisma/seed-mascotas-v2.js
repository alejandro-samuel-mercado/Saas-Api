// seed-mascotas-v2.js
// Run: node prisma/seed-mascotas-v2.js
// Crea 20 productos de ejemplo para el rubro Mascotas en el tenant correcto.

const prisma = require("../src/config/prisma");

const TENANT_ID = process.env.SEED_TENANT_ID || "d6d17196-1e05-49e9-9407-82e3e1791902";

async function main() {
    console.log(`\n🐾 Seeding Mascotas para tenantId: ${TENANT_ID}\n`);

    // 1. Rubro
    const rubro = await prisma.rubro.findUnique({ where: { slug: "mascotas" } });
    if (!rubro) {
        console.error("❌ El rubro 'mascotas' no existe. Ejecuta seed-rubros.js primero.");
        process.exit(1);
    }
    console.log(`✅ Rubro: ${rubro.name}`);

    // 2. Tenant
    const tenant = await prisma.tenant.findUnique({ where: { id: TENANT_ID } });
    if (!tenant) {
        console.error(`❌ Tenant ${TENANT_ID} no encontrado.`);
        process.exit(1);
    }
    console.log(`✅ Tenant: ${tenant.name}`);

    // 3. Categorías
    const categoryDefs = [
        { name: "Alimentos Perros", slug: `alimentos-perros-${TENANT_ID}` },
        { name: "Alimentos Gatos", slug: `alimentos-gatos-${TENANT_ID}` },
        { name: "Accesorios", slug: `accesorios-mascotas-${TENANT_ID}` },
        { name: "Higiene y Cuidado", slug: `higiene-mascotas-${TENANT_ID}` },
        { name: "Juguetes", slug: `juguetes-mascotas-${TENANT_ID}` },
        { name: "Salud y Prevención", slug: `salud-mascotas-${TENANT_ID}` },
    ];

    const categories = {};
    for (const cat of categoryDefs) {
        const created = await prisma.category.upsert({
            where: { tenantId_slug: { tenantId: TENANT_ID, slug: cat.slug } },
            update: { name: cat.name },
            create: { name: cat.name, slug: cat.slug, tenantId: TENANT_ID },
        });
        categories[cat.name] = created;
        console.log(`  📁 Categoría: ${cat.name}`);
    }

    // 4. Branch
    const branch = await prisma.branch.findFirst({ where: { tenantId: TENANT_ID } });

    // 5. Productos
    const products = [
        // ── ALIMENTOS PERROS ──
        {
            name: "Royal Canin Medium Adult 15kg",
            description: "Fórmula avanzada para perros adultos de razas medianas (11–25 kg). Enriquecida con ácidos grasos Omega para piel y pelo saludable.",
            brand: "Royal Canin", category: "Alimentos Perros",
            basePrice: 89000, isTrending: true, isNew: false,
            images: ["https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&q=80&w=800"],
            characteristics: [
                { key: "Peso", value: "15 kg" }, { key: "Raza Target", value: "Mediana (11–25 kg)" },
                { key: "Etapa de vida", value: "Adulto 1–7 años" }, { key: "Sabor", value: "Carne y Arroz" },
            ]
        },
        {
            name: "Pro Plan Puppy Razas Medianas 3kg",
            description: "Nutrición avanzada con OPTISTART para cachorros en etapa de crecimiento. Alto contenido en DHA de aceite de pescado.",
            brand: "Purina Pro Plan", category: "Alimentos Perros",
            basePrice: 27000, isTrending: true, isNew: true,
            images: ["https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?auto=format&fit=crop&q=80&w=800"],
            characteristics: [
                { key: "Peso", value: "3 kg" }, { key: "Raza Target", value: "Razas medianas" },
                { key: "Etapa de vida", value: "Cachorro 0–15 meses" }, { key: "Sabor", value: "Pollo" },
            ]
        },
        {
            name: "Pedigree Adulto Carne y Pollo 21kg",
            description: "Alimento completo 100% balanceado para perros adultos. Sin colorantes artificiales, con vitaminas y minerales esenciales.",
            brand: "Pedigree", category: "Alimentos Perros",
            basePrice: 54000, isTrending: false, isNew: false,
            images: ["https://images.unsplash.com/photo-1585559604473-b3eb2788e250?auto=format&fit=crop&q=80&w=800"],
            characteristics: [
                { key: "Peso", value: "21 kg" }, { key: "Raza Target", value: "Todas las razas" },
                { key: "Etapa de vida", value: "Adulto" }, { key: "Sabor", value: "Carne y Pollo" },
            ]
        },
        {
            name: "Hill's Science Diet Razas Grandes 12kg",
            description: "Alimento con glucosamina y condroitina para el cuidado articular de perros adultos de razas grandes.",
            brand: "Hill's", category: "Alimentos Perros",
            basePrice: 98000, isTrending: false, isNew: true,
            images: ["https://images.unsplash.com/photo-1546422401-ae71c2e1b6d8?auto=format&fit=crop&q=80&w=800"],
            characteristics: [
                { key: "Peso", value: "12 kg" }, { key: "Raza Target", value: "Razas grandes (+25 kg)" },
                { key: "Etapa de vida", value: "Adulto 1–6 años" }, { key: "Beneficio clave", value: "Articulaciones" },
            ]
        },

        // ── ALIMENTOS GATOS ──
        {
            name: "Royal Canin Feline Health Nutrition 2kg",
            description: "Nutrición a medida para el bienestar urinario del gato adulto. Apoya la salud del tracto urinario y la digestión óptima.",
            brand: "Royal Canin", category: "Alimentos Gatos",
            basePrice: 28000, isTrending: true, isNew: false,
            images: ["https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?auto=format&fit=crop&q=80&w=800"],
            characteristics: [
                { key: "Peso", value: "2 kg" }, { key: "Mascota", value: "Gato adulto +12 meses" },
                { key: "Beneficio clave", value: "Salud urinaria" }, { key: "Sabor", value: "Pollo" },
            ]
        },
        {
            name: "Whiskas Adulto Pescado 3kg",
            description: "Alimento seco completo para gatos adultos con delicioso sabor a pescado. Fórmula con Omega 3 y 6.",
            brand: "Whiskas", category: "Alimentos Gatos",
            basePrice: 15000, isTrending: false, isNew: false,
            images: ["https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800"],
            characteristics: [
                { key: "Peso", value: "3 kg" }, { key: "Etapa de vida", value: "Adulto" },
                { key: "Sabor", value: "Pescado" }, { key: "Mascota", value: "Gato" },
            ]
        },
        {
            name: "Cat Chow Gatitos Pollo 1kg",
            description: "Fórmula especial para el rápido crecimiento de gatitos de hasta 12 meses. Rica en proteínas animales.",
            brand: "Purina", category: "Alimentos Gatos",
            basePrice: 7000, isTrending: false, isNew: true,
            images: ["https://images.unsplash.com/photo-1582798358481-d199fb7347bb?auto=format&fit=crop&q=80&w=800"],
            characteristics: [
                { key: "Peso", value: "1 kg" }, { key: "Etapa de vida", value: "Gatito 0–12 meses" },
                { key: "Sabor", value: "Pollo" }, { key: "Mascota", value: "Gato" },
            ]
        },

        // ── ACCESORIOS ──
        {
            name: "Collar Ajustable con LED",
            description: "Collar de nylon premium con luz LED integrada para mayor visibilidad nocturna. Hebilla de aluminio inoxidable.",
            brand: "Zeedog", category: "Accesorios",
            basePrice: 12000, isTrending: true, isNew: true,
            images: ["https://images.unsplash.com/photo-1601758174114-e711c0cbaa69?auto=format&fit=crop&q=80&w=800"],
            characteristics: [
                { key: "Material", value: "Nylon reflectivo + LED" }, { key: "Tallas disponibles", value: "S / M / L" },
                { key: "Batería", value: "USB Recargable" }, { key: "Mascota", value: "Perro / Gato" },
            ]
        },
        {
            name: "Arnés Ergonómico Sin-tiro",
            description: "Arnés acolchado con diseño ergonómico que evita el ahogo al tirar. Doble enganche para mayor seguridad.",
            brand: "Ruffwear", category: "Accesorios",
            basePrice: 38000, isTrending: true, isNew: false,
            images: ["https://images.unsplash.com/photo-1601758174493-62aa7f5c3ce0?auto=format&fit=crop&q=80&w=800"],
            characteristics: [
                { key: "Material", value: "Poliéster 100% acolchado" }, { key: "Talla", value: "L (30–45 kg)" },
                { key: "Color", value: "Negro / Naranja" }, { key: "Mascota", value: "Perro" },
            ]
        },
        {
            name: "Correa Retráctil Flexi 5m",
            description: "Correa extensible hasta 5 metros con freno y cierre de seguridad. Mango ergonómico antideslizante.",
            brand: "Flexi", category: "Accesorios",
            basePrice: 22000, isTrending: false, isNew: false,
            images: ["https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800"],
            characteristics: [
                { key: "Largo", value: "5 metros" }, { key: "Peso max mascota", value: "hasta 20 kg" },
                { key: "Material cuerda", value: "Nylon trenzado" }, { key: "Color", value: "Rojo / Negro" },
            ]
        },
        {
            name: "Cama Ortopédica Memory Foam L",
            description: "Cama de espuma viscoelástica que alivia la presión articular. Cubierta lavable a máquina con cierre oculto.",
            brand: "Bestpet", category: "Accesorios",
            basePrice: 65000, isTrending: false, isNew: true,
            images: ["https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=800"],
            characteristics: [
                { key: "Tamaño", value: "90 x 70 cm" }, { key: "Relleno", value: "Memory Foam 10 cm" },
                { key: "Cubierta", value: "Lavable" }, { key: "Mascota", value: "Perro / Gato" },
            ]
        },

        // ── HIGIENE ──
        {
            name: "Shampoo Hipoalergénico Natural 500ml",
            description: "Shampoo pH neutro con aloe vera y vitamina E para mascotas con piel sensible. Sin parabenos ni colorantes.",
            brand: "Osspret", category: "Higiene y Cuidado",
            basePrice: 14000, isTrending: false, isNew: false,
            images: ["https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=800"],
            characteristics: [
                { key: "Contenido", value: "500 ml" }, { key: "pH", value: "Neutro" },
                { key: "Ingrediente principal", value: "Aloe Vera" }, { key: "Apto para", value: "Perros y Gatos" },
            ]
        },
        {
            name: "Arena Sanitaria Aglomerante 10kg",
            description: "Arena de máxima absorción con tecnología ultrasónica que controla olores por hasta 30 días.",
            brand: "Catsan", category: "Higiene y Cuidado",
            basePrice: 18000, isTrending: true, isNew: false,
            images: ["https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&q=80&w=800"],
            characteristics: [
                { key: "Peso", value: "10 kg" }, { key: "Tipo", value: "Aglomerante mineral" },
                { key: "Control de olor", value: "Hasta 30 días" }, { key: "Mascota", value: "Gato" },
            ]
        },
        {
            name: "Cepillo Deslanador FURminator",
            description: "Reduce la caída del pelo hasta en un 90%. Blade de acero inoxidable con botón FURejector para limpiar fácilmente.",
            brand: "FURminator", category: "Higiene y Cuidado",
            basePrice: 35000, isTrending: false, isNew: false,
            images: ["https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&q=80&w=800"],
            characteristics: [
                { key: "Para", value: "Pelo largo y mediano" }, { key: "Talla", value: "M" },
                { key: "Material filo", value: "Acero inoxidable" }, { key: "Mascota", value: "Perros y Gatos" },
            ]
        },

        // ── JUGUETES ──
        {
            name: "Kong Classic Rellenable Talla M",
            description: "Juguete de goma natural ultrarresistente para estimulación mental. Rellenable con premios para entretener horas.",
            brand: "Kong", category: "Juguetes",
            basePrice: 18000, isTrending: true, isNew: false,
            images: ["https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=800"],
            characteristics: [
                { key: "Material", value: "Goma natural vulcanizada" }, { key: "Talla", value: "M (9–25 kg)" },
                { key: "Rellenable", value: "Sí" }, { key: "Mascota", value: "Perro" },
            ]
        },
        {
            name: "Varita Interactiva con Plumas para Gato",
            description: "Juguete de estimulación para gatos con plumas de colores y cascabel. Mango extensible de 60 cm.",
            brand: "PlayPet", category: "Juguetes",
            basePrice: 5000, isTrending: false, isNew: true,
            images: ["https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?auto=format&fit=crop&q=80&w=800"],
            characteristics: [
                { key: "Largo", value: "60 cm extensible" }, { key: "Componentes", value: "Plumas + Cascabel" },
                { key: "Material", value: "Metal / Plástico" }, { key: "Mascota", value: "Gato" },
            ]
        },
        {
            name: "Rascador Sisal con Casa y Plataformas",
            description: "Árbol rascador de 3 niveles con casita interior, plataformas y colgante. Ideal para estimulación y descanso.",
            brand: "CatToy", category: "Juguetes",
            basePrice: 72000, isTrending: true, isNew: true,
            images: ["https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&q=80&w=800"],
            characteristics: [
                { key: "Alto", value: "120 cm" }, { key: "Material", value: "MDF + Cuerda Sisal" },
                { key: "Niveles", value: "3" }, { key: "Mascota", value: "Gato" },
            ]
        },

        // ── SALUD ──
        {
            name: "Pipeta Antipulgas Frontline 10–20kg",
            description: "Protección mensual contra pulgas, garrapatas y piojos. Actúa en 12 horas. Resistente al agua.",
            brand: "Frontline", category: "Salud y Prevención",
            basePrice: 16500, isTrending: false, isNew: false,
            images: ["https://images.unsplash.com/photo-1563906267088-b029e7101114?auto=format&fit=crop&q=80&w=800"],
            characteristics: [
                { key: "Duración", value: "1 mes" }, { key: "Peso mascota", value: "10–20 kg" },
                { key: "Resistente al agua", value: "Sí" }, { key: "Mascota", value: "Perro" },
            ]
        },
        {
            name: "Bravecto Comprimido 250mg 4,5–10kg",
            description: "Tableta masticable de sabor atractivo que previene pulgas y garrapatas durante 12 semanas con una sola dosis.",
            brand: "Bravecto", category: "Salud y Prevención",
            basePrice: 38000, isTrending: true, isNew: false,
            images: ["https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=800"],
            characteristics: [
                { key: "Duración", value: "12 semanas" }, { key: "Peso mascota", value: "4,5–10 kg" },
                { key: "Sabor", value: "Cerdo" }, { key: "Presentación", value: "1 comprimido masticable" },
            ]
        },
        {
            name: "Suplemento Articular con Colágeno",
            description: "Suplemento premium con colágeno hidrolizado, glucosamina y condroitina para articulaciones sanas en perros adultos.",
            brand: "Artroflex Vet", category: "Salud y Prevención",
            basePrice: 24000, isTrending: false, isNew: true,
            images: ["https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=800"],
            characteristics: [
                { key: "Presentación", value: "60 cápsulas" }, { key: "Para", value: "Perros adultos +5 años" },
                { key: "Ingrediente clave", value: "Colágeno Hidrolizado + Glucosamina" },
                { key: "Sabor", value: "Natural" },
            ]
        },
    ];

    let created = 0;
    for (const p of products) {
        const cat = categories[p.category];
        if (!cat) { console.warn(`⚠️  Categoría "${p.category}" no encontrada`); continue; }

        const code = `MASCT-${Date.now()}-${created}`;

        await prisma.product.create({
            data: {
                name: p.name,
                description: p.description,
                brand: p.brand,
                model: "-",
                type: "Fisico",
                categoryId: cat.id,
                tenantId: TENANT_ID,
                basePrice: p.basePrice,
                images: p.images,
                isTrending: p.isTrending,
                isNew: p.isNew,
                isActive: true,
                saleMode: "VENTA",
                characteristics: p.characteristics,
                specifications: [],
                condition: "NEW",
                measurementUnit: "UNIDAD",
                skus: {
                    create: [{
                        code,
                        price: p.basePrice,
                        stock: 50,
                        active: true,
                        tenantId: TENANT_ID,
                        ...(branch && {
                            branchInventory: {
                                create: [{
                                    branchId: branch.id,
                                    stock: 50,
                                    minStock: 5,
                                    maxStock: 200,
                                    price: p.basePrice
                                }]
                            }
                        })
                    }]
                }
            }
        });
        created++;
        console.log(`✅ ${created}. ${p.name}`);
    }

    console.log(`\n🎉 ¡Seed completado! ${created} productos creados para el rubro Mascotas.\n`);
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
