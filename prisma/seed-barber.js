require("dotenv").config();
const prisma = require("../src/config/prisma");
const bcrypt = require('bcryptjs');

async function main() {
  console.log("Iniciando seed de Barbería y Salones...");

  // 1. Ensure Rubro exists
  let rubro = await prisma.rubro.findUnique({ where: { slug: 'barberias' } });
  if (!rubro) {
    console.error("El rubro 'barberias' no existe. Ejecuta seed-rubros.js primero.");
    process.exit(1);
  }

  // 2. Get the first existing Tenant
  let tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    console.error("No se encontró ningún tenant existente. Por favor, crea un tenant primero.");
    process.exit(1);
  }

  // Update tenant to use Barberia rubro
  await prisma.tenant.update({
    where: { id: tenant.id },
    data: { rubroId: rubro.id }
  });
  console.log(`Tenant '${tenant.name}' actualizado al rubro Barbería y Salones.`);

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
  const categoryNames = ['Cortes', 'Afeitados', 'Arreglos de Barba', 'Tratamientos Faciales', 'Peinados', 'Tratamientos Capilares', 'Productos de Cuidado'];
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

  // 4. Create Products/Services with specific data
  const services = [
    { name: 'Corte Tradicional', cat: 'Cortes', price: 3000, desc: 'Corte clásico con tijera y máquina.', isService: true },
    { name: 'Afeitado con Toalla Caliente', cat: 'Afeitados', price: 2000, desc: 'Afeitado tradicional con navaja y toalla caliente.', isService: true },
    { name: 'Arreglo de Barba Completo', cat: 'Arreglos de Barba', price: 1500, desc: 'Recorte, perfilado y cuidado de barba.', isService: true },
    { name: 'Facial Revitalizante', cat: 'Tratamientos Faciales', price: 4000, desc: 'Limpieza profunda e hidratación.', isService: true },
    { name: 'Peinado Pompadour', cat: 'Peinados', price: 2500, desc: 'Peinado especial con productos premium.', isService: true },
    { name: 'Masaje Capilar', cat: 'Tratamientos Capilares', price: 3500, desc: 'Masaje relajante con aceites esenciales.', isService: true },
    { 
      name: 'Aceite Premium para Barba', 
      cat: 'Productos de Cuidado', 
      price: 2500, 
      desc: 'Aceite nutritivo para el crecimiento y cuidado de la barba.', 
      isService: false,
      attributes: {
        "Marca": "Slick Grooming",
        "Origen": "Nacional",
        "Uso": "Personal",
        "Contenido (ml/gr)": "50ml",
        "Tipo artículo": "Aceite",
        "Instrucciones de uso": "Aplicar 3-4 gotas en la barba húmeda"
      }
    },
    { 
      name: 'Máquina Cortapelo Profesional', 
      cat: 'Productos de Cuidado', 
      price: 120000, 
      desc: 'Máquina de alta potencia para barberos exigentes.', 
      isService: false,
      attributes: {
        "Marca": "Wahl Pro",
        "Origen": "USA",
        "Uso": "Profesional",
        "Material": "Acero Inoxidable",
        "Voltaje/Potencia": "220V / 10W",
        "Color": "Plata/Negro",
        "Instrucciones de uso": "Limpiar y lubricar después de cada uso"
      }
    }
  ];

  for (const s of services) {
    const p = await prisma.product.findFirst({ where: { name: s.name, tenantId: tenant.id } });
    if (!p) {
      const prod = await prisma.product.create({
        data: {
          name: s.name,
          description: s.desc,
          categoryId: categories[s.cat].id,
          tenantId: tenant.id,
          basePrice: s.price,
          saleMode: s.isService ? 'AMBOS' : 'VENTA',
          images: ['https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
          brand: s.attributes && s.attributes['Marca'] ? s.attributes['Marca'] : '-',
          model: '-',
          type: s.attributes && s.attributes['Tipo artículo'] ? s.attributes['Tipo artículo'] : 'Servicio',
          characteristics: s.attributes ? Object.entries(s.attributes).map(([key, value]) => ({ key, value })) : [{ key: "Uso", value: "Personal" }]
        }
      });
      // Add a SKU to have stock
      await prisma.sKU.create({
        data: {
          productId: prod.id,
          code: 'CODE-' + prod.id,
          price: s.price,
          stock: s.isService ? 9999 : 50,
          tenantId: tenant.id
        }
      });
    }
  }
  
  console.log("Productos y servicios creados.");
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
