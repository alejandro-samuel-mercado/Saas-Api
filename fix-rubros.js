require("dotenv").config();
const prisma = require("./src/config/prisma");

async function main() {
  // Update Mascotas products
  const mascotasRubro = await prisma.rubro.findUnique({ where: { slug: 'mascotas' } });
  const mascotasCategories = ['Alimentos Perros', 'Alimentos Gatos', 'Accesorios', 'Higiene', 'Juguetes', 'Salud'];
  const mascotasCats = await prisma.category.findMany({
    where: { name: { in: mascotasCategories } }
  });
  const mascotasCatIds = mascotasCats.map(c => c.id);

  // We only want to update products that are actually for Mascotas.
  // Our seeded Mascotas products have specific names, or we can check their categories.
  // Note: 'Accesorios' is also a category in Relojes, so let's check product names for Mascotas.
  const mascotasProductNames = [
    'Royal Canin Medium Adult 15kg',
    'Pro Plan Puppy Razas Medianas 3kg',
    'Eukanuba Adulto Razas Grandes 15kg',
    'Pedigree Adulto Carne y Pollo 21kg',
    'Whiskas Adulto Carne 3kg',
    'Cat Chow Gatitos Pescado 1kg',
    'Royal Canin Feline Care Nutrition 2kg',
    'Collar Ajustable Reflectivo',
    'Correa Retráctil 5m',
    'Arnés de Paseo Acolchado',
    'Shampoo Hipoalergénico 250ml',
    'Arena Sanitaria Aglomerante 4kg',
    'Cepillo Deslanador',
    'Juguete Kong Classic',
    'Pelota de Goma con Sonido',
    'Rascador de Cartón Corrugado',
    'Pipeta Antipulgas Perros 10-20kg',
    'Comprimido Antiparasitario'
  ];

  const res1 = await prisma.product.updateMany({
    where: {
      name: { in: mascotasProductNames }
    },
    data: {
      rubroId: mascotasRubro.id
    }
  });
  console.log(`Updated ${res1.count} Mascotas products with rubroId: ${mascotasRubro.id}`);

  // Also update Barber products just in case
  const barberRubro = await prisma.rubro.findUnique({ where: { slug: 'barberias' } });
  const barberProductNames = [
    'Corte Tradicional',
    'Afeitado con Toalla Caliente',
    'Arreglo de Barba Completo',
    'Facial Revitalizante',
    'Peinado Pompadour',
    'Masaje Capilar',
    'Aceite Premium para Barba',
    'Máquina Cortapelo Profesional'
  ];
  const res2 = await prisma.product.updateMany({
    where: {
      name: { in: barberProductNames }
    },
    data: {
      rubroId: barberRubro.id
    }
  });
  console.log(`Updated ${res2.count} Barber products with rubroId: ${barberRubro.id}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
