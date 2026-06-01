const prisma = require('../config/prisma');

async function main() {
  console.log('Iniciando seed de Inmobiliaria...');
  const tenantId = 'default';

  const branch = await prisma.branch.findFirst({
    where: { tenantId }
  });

  if (!branch) {
    throw new Error("No se encontró sucursal para el tenant 'default'.");
  }

  let catInmueble = await prisma.category.findFirst({
    where: { slug: 'inmuebles-premium', tenantId }
  });

  if (!catInmueble) {
    catInmueble = await prisma.category.create({
      data: { name: 'Inmuebles Premium', slug: 'inmuebles-premium', tenantId }
    });
  }

  let catLote = await prisma.category.findFirst({
    where: { slug: 'terrenos-y-lotes', tenantId }
  });

  if (!catLote) {
    catLote = await prisma.category.create({
      data: { name: 'Terrenos y Lotes', slug: 'terrenos-y-lotes', tenantId }
    });
  }

  await prisma.product.updateMany({
    where: { tenantId },
    data: { isActive: false, isDeleted: true }
  });

  console.log('Productos anteriores desactivados.');

  const mansion = await prisma.product.create({
    data: {
      name: 'Mansión Exclusiva en Nordelta',
      description: 'Arquitectura de vanguardia con terminaciones de extrema calidad. Amplios ventanales, domótica en toda la casa, piscina infinita y muelle privado.\n\nIdeal para familias que buscan máxima seguridad y confort en un entorno rodeado de naturaleza.',
      images: [
        'https://images.unsplash.com/photo-1613490900233-141c5560d75d?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2000&auto=format&fit=crop'
      ],
      qr: 'INM-MANSION-FINAL',
      categoryId: catInmueble.id,
      basePrice: 1250000,
      brand: 'Nordelta, Buenos Aires',
      condition: 'NEW',
      isNew: true,
      isRecommended: true,
      isTrending: true,
      measurementUnit: 'UNIDAD',
      type: 'Producto',
      tenantId,
      saleMode: 'VENTA',
      characteristics: [
        { key: 'Área total (m²)', value: '1200' },
        { key: 'Área construida (m²)', value: '650' },
        { key: 'Frente x Fondo', value: '30x40' },
        { key: 'Dormitorios', value: '5 (3 en suite)' },
        { key: 'Baños', value: '6' },
        { key: 'Cochera', value: '4 autos cubiertos' },
        { key: 'Servicios (Agua/Luz/Gas)', value: 'Todos conectados y domotizados' },
        { key: 'Estado Legal', value: 'Escritura al día' },
        { key: 'Gravámenes', value: 'Ninguno' },
        { key: 'Formas de pago', value: 'Contado / Criptomonedas' }
      ]
    }
  });

  const mansionSku = await prisma.sKU.create({
    data: {
      productId: mansion.id,
      code: 'SKU-MANSION-FINAL',
      price: 1250000,
      tenantId
    }
  });

  await prisma.branchInventory.create({
    data: {
      skuId: mansionSku.id,
      branchId: branch.id,
      stock: 1,
      price: 1250000
    }
  });

  console.log('Mansión creada:', mansion.name);

  const lote = await prisma.product.create({
    data: {
      name: 'Lote al Lago Central',
      description: 'Lote premium con salida directa al lago central. Excelente orientación Noroeste.',
      images: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1628611225249-6c478a577f80?q=80&w=2000&auto=format&fit=crop'
      ],
      qr: 'INM-LOTE-FINAL',
      categoryId: catLote.id,
      basePrice: 450000,
      brand: 'Puertos de Escobar',
      condition: 'NEW',
      isNew: false,
      isRecommended: true,
      isTrending: false,
      measurementUnit: 'UNIDAD',
      type: 'Producto',
      tenantId,
      saleMode: 'VENTA',
      characteristics: [
        { key: 'Área total (m²)', value: '950' },
        { key: 'Área construida (m²)', value: '0' },
        { key: 'Frente x Fondo', value: '22x43' },
        { key: 'Servicios', value: 'Agua, Luz, Gas natural a pie de lote' },
        { key: 'Estado Legal', value: 'Fideicomiso' },
        { key: 'Formas de pago', value: 'Contado / Financiación' }
      ]
    }
  });

  const loteSku = await prisma.sKU.create({
    data: {
      productId: lote.id,
      code: 'SKU-LOTE-FINAL',
      price: 450000,
      tenantId
    }
  });

  await prisma.branchInventory.create({
    data: {
      skuId: loteSku.id,
      branchId: branch.id,
      stock: 1,
      price: 450000
    }
  });

  console.log('Lote creado:', lote.name);
  console.log('Seed completado exitosamente.');
}

main()
  .catch((e) => {
    console.error("ERROR DETALLADO:", e.message || e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
