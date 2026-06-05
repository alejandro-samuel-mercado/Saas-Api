require("dotenv").config();
const prisma = require("../src/config/prisma");

async function main() {
  console.log("Iniciando seed de Mascotas...");

  // 1. Ensure Rubro exists
  let rubro = await prisma.rubro.findUnique({ where: { slug: 'mascotas' } });
  if (!rubro) {
    console.error("El rubro 'mascotas' no existe. Por favor crealo primero o ejecuta seed-rubros.js.");
    process.exit(1);
  }

  // 2. Get the first existing Tenant
  let tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    console.error("No se encontró ningún tenant existente. Por favor, crea un tenant primero.");
    process.exit(1);
  }

  // Update tenant to use Mascotas rubro
  await prisma.tenant.update({
    where: { id: tenant.id },
    data: { rubroId: rubro.id }
  });
  console.log(`Tenant '${tenant.name}' actualizado al rubro Mascotas.`);

  // Ensure StoreConfig exists
  let storeConfig = await prisma.storeConfig.findUnique({ where: { tenantId: tenant.id } });
  if (!storeConfig) {
    await prisma.storeConfig.create({
      data: {
        tenantId: tenant.id,
        storeName: tenant.name,
        logoUrl: '/placeholder-logo.png',
        contactPhone: '1234567890'
      }
    });
    console.log("StoreConfig creado.");
  }

  // 3. Create Categories
  const categoryNames = ['Alimentos Perros', 'Alimentos Gatos', 'Accesorios', 'Higiene', 'Juguetes', 'Salud'];
  const categories = {};
  for (const name of categoryNames) {
    let cat = await prisma.category.findFirst({ where: { name, tenantId: tenant.id } });
    if (!cat) {
      cat = await prisma.category.create({
        data: { name, slug: name.toLowerCase().replace(/ /g, '-'), tenantId: tenant.id }
      });
    }
    categories[name] = cat;
  }
  console.log("Categorías creadas.");

  // 4. Create Products with specific data
  const productsList = [
    { 
      name: 'Royal Canin Medium Adult 15kg', 
      cat: 'Alimentos Perros', 
      price: 85000, 
      desc: 'Alimento premium balanceado para perros adultos de razas medianas.', 
      brand: 'Royal Canin',
      image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&q=80&w=800',
      attributes: { "Peso": "15kg", "Etapa de Vida": "Adulto", "Sabor": "Carne", "Tamaño Raza": "Mediano" }
    },
    { 
      name: 'Pro Plan Puppy Razas Medianas 3kg', 
      cat: 'Alimentos Perros', 
      price: 24000, 
      desc: 'Nutrición avanzada para cachorros en etapa de crecimiento.', 
      brand: 'Purina',
      image: 'https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?auto=format&fit=crop&q=80&w=800',
      attributes: { "Peso": "3kg", "Etapa de Vida": "Cachorro", "Sabor": "Pollo", "Tamaño Raza": "Mediano" }
    },
    { 
      name: 'Eukanuba Adulto Razas Grandes 15kg', 
      cat: 'Alimentos Perros', 
      price: 78000, 
      desc: 'Fórmula especial para mantener el sistema articular de razas grandes.', 
      brand: 'Eukanuba',
      image: 'https://plus.unsplash.com/premium_photo-1663126298656-33616be83c32?auto=format&fit=crop&q=80&w=800',
      attributes: { "Peso": "15kg", "Etapa de Vida": "Adulto", "Sabor": "Pollo", "Tamaño Raza": "Grande" }
    },
    { 
      name: 'Pedigree Adulto Carne y Pollo 21kg', 
      cat: 'Alimentos Perros', 
      price: 52000, 
      desc: 'Alimento completo 100% balanceado para perros adultos.', 
      brand: 'Pedigree',
      image: 'https://images.unsplash.com/photo-1585559604473-b3eb2788e250?auto=format&fit=crop&q=80&w=800',
      attributes: { "Peso": "21kg", "Etapa de Vida": "Adulto", "Sabor": "Carne y Pollo", "Tamaño Raza": "Todos" }
    },
    { 
      name: 'Whiskas Adulto Carne 3kg', 
      cat: 'Alimentos Gatos', 
      price: 15000, 
      desc: 'Alimento seco con relleno crujiente para gatos adultos.', 
      brand: 'Whiskas',
      image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800',
      attributes: { "Peso": "3kg", "Etapa de Vida": "Adulto", "Sabor": "Carne", "Mascota": "Gato" }
    },
    { 
      name: 'Cat Chow Gatitos Pescado 1kg', 
      cat: 'Alimentos Gatos', 
      price: 6500, 
      desc: 'Defensa activa con vitaminas para el correcto desarrollo del gatito.', 
      brand: 'Purina',
      image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800',
      attributes: { "Peso": "1kg", "Etapa de Vida": "Gatito", "Sabor": "Pescado", "Mascota": "Gato" }
    },
    { 
      name: 'Royal Canin Feline Care Nutrition 2kg', 
      cat: 'Alimentos Gatos', 
      price: 22000, 
      desc: 'Salud urinaria comprobada para tu felino.', 
      brand: 'Royal Canin',
      image: 'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?auto=format&fit=crop&q=80&w=800',
      attributes: { "Peso": "2kg", "Etapa de Vida": "Adulto", "Sabor": "Pollo", "Mascota": "Gato" }
    },
    { 
      name: 'Collar Ajustable Reflectivo', 
      cat: 'Accesorios', 
      price: 8500, 
      desc: 'Collar de alta visibilidad, cómodo y ajustable.', 
      brand: 'PetLife',
      image: 'https://images.unsplash.com/photo-1601758174114-e711c0cbaa69?auto=format&fit=crop&q=80&w=800',
      attributes: { "Material": "Nylon Reflectivo", "Talla": "M", "Color": "Naranja" }
    },
    { 
      name: 'Correa Retráctil 5m', 
      cat: 'Accesorios', 
      price: 18000, 
      desc: 'Correa extensible hasta 5 metros con botón de freno de seguridad.', 
      brand: 'Flexi',
      image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800',
      attributes: { "Material": "Plástico / Cuerda", "Largo": "5 metros", "Talla": "L" }
    },
    { 
      name: 'Arnés de Paseo Acolchado', 
      cat: 'Accesorios', 
      price: 25000, 
      desc: 'Arnés ergonómico que evita el ahogo al tirar durante el paseo.', 
      brand: 'Zeedog',
      image: 'https://images.unsplash.com/photo-1601758174493-62aa7f5c3ce0?auto=format&fit=crop&q=80&w=800',
      attributes: { "Material": "Poliéster Acolchado", "Talla": "L", "Color": "Negro" }
    },
    { 
      name: 'Shampoo Hipoalergénico 250ml', 
      cat: 'Higiene', 
      price: 12000, 
      desc: 'Shampoo suave para mascotas con piel sensible. Libre de parabenos.', 
      brand: 'Osspret',
      image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=800',
      attributes: { "Contenido": "250ml", "Tipo": "Hipoalergénico", "Aplicación": "Baño" }
    },
    { 
      name: 'Arena Sanitaria Aglomerante 4kg', 
      cat: 'Higiene', 
      price: 9000, 
      desc: 'Arena para gatos con máxima capacidad de absorción y control de olores.', 
      brand: 'CatMaster',
      image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800',
      attributes: { "Peso": "4kg", "Tipo": "Aglomerante", "Mascota": "Gato" }
    },
    { 
      name: 'Cepillo Deslanador', 
      cat: 'Higiene', 
      price: 21000, 
      desc: 'Reduce la caída del pelo hasta en un 90%. Borde de acero inoxidable.', 
      brand: 'Furminator',
      image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800',
      attributes: { "Material": "Acero / Goma", "Uso": "Pelo Largo", "Talla": "M" }
    },
    { 
      name: 'Juguete Kong Classic', 
      cat: 'Juguetes', 
      price: 16500, 
      desc: 'Juguete interactivo de goma natural ultrarresistente. Rellenable.', 
      brand: 'KONG',
      image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=800',
      attributes: { "Material": "Goma Natural", "Talla": "M", "Color": "Rojo" }
    },
    { 
      name: 'Pelota de Goma con Sonido', 
      cat: 'Juguetes', 
      price: 4500, 
      desc: 'Pelota rebotadora con chifle interno para estimular a tu mascota.', 
      brand: 'PlayPet',
      image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=800',
      attributes: { "Material": "Goma Termoplástica", "Sonido": "Sí", "Color": "Amarillo" }
    },
    { 
      name: 'Rascador de Cartón Corrugado', 
      cat: 'Juguetes', 
      price: 11000, 
      desc: 'Rascador horizontal que incluye bolsita de catnip para mayor atracción.', 
      brand: 'CatToy',
      image: 'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?auto=format&fit=crop&q=80&w=800',
      attributes: { "Material": "Cartón", "Catnip Incluido": "Sí", "Mascota": "Gato" }
    },
    { 
      name: 'Pipeta Antipulgas Perros 10-20kg', 
      cat: 'Salud', 
      price: 14500, 
      desc: 'Protección mensual contra pulgas, garrapatas y piojos.', 
      brand: 'Frontline',
      image: 'https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?auto=format&fit=crop&q=80&w=800',
      attributes: { "Duración": "1 mes", "Peso Mascota": "10 a 20kg", "Presentación": "Unidad" }
    },
    { 
      name: 'Comprimido Antiparasitario', 
      cat: 'Salud', 
      price: 32000, 
      desc: 'Tableta masticable para la prevención y tratamiento de pulgas y garrapatas por 12 semanas.', 
      brand: 'Bravecto',
      image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&q=80&w=800',
      attributes: { "Duración": "12 semanas", "Peso Mascota": "10 a 20kg", "Formato": "Masticable" }
    }
  ];

  // Get all branches to populate inventory
  const branches = await prisma.branch.findMany();

  for (const s of productsList) {
    const p = await prisma.product.findFirst({ where: { name: s.name, tenantId: tenant.id } });
    if (!p) {
      const prod = await prisma.product.create({
        data: {
          name: s.name,
          description: s.desc,
          categoryId: categories[s.cat].id,
          tenantId: tenant.id,
          basePrice: s.price,
          saleMode: 'VENTA',
          images: [s.image],
          brand: s.brand,
          model: '-',
          type: 'Fisico',
          rubroId: rubro.id,
          characteristics: s.attributes ? Object.entries(s.attributes).map(([key, value]) => ({ key, value })) : []
        }
      });
      // Add a SKU to have stock
      const sku = await prisma.sKU.create({
        data: {
          productId: prod.id,
          code: 'SKU-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
          price: s.price,
          stock: 50,
          tenantId: tenant.id
        }
      });

      // Create branch inventory for this SKU in all branches
      for (const branch of branches) {
        await prisma.branchInventory.create({
          data: {
            skuId: sku.id,
            branchId: branch.id,
            stock: 50,
            price: s.price,
            isActive: true
          }
        });
      }
    }
  }
  
  console.log("Productos creados: " + productsList.length);
  console.log("¡Seed completado exitosamente!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
