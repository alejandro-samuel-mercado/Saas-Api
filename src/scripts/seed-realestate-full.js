const prisma = require('../config/prisma');

async function main() {
  console.log('Iniciando seed de Inmobiliaria Full Premium...');
  const tenantId = 'default';

  const branch = await prisma.branch.findFirst({ where: { tenantId } });
  if (!branch) throw new Error("No se encontró sucursal para el tenant 'default'.");

  let catInmueble = await prisma.category.findFirst({ where: { slug: 'inmuebles-premium', tenantId } });
  if (!catInmueble) catInmueble = await prisma.category.create({ data: { name: 'Inmuebles Premium', slug: 'inmuebles-premium', tenantId } });

  let catLote = await prisma.category.findFirst({ where: { slug: 'terrenos-y-lotes', tenantId } });
  if (!catLote) catLote = await prisma.category.create({ data: { name: 'Terrenos y Lotes', slug: 'terrenos-y-lotes', tenantId } });

  let catAlquiler = await prisma.category.findFirst({ where: { slug: 'alquileres-exclusivos', tenantId } });
  if (!catAlquiler) catAlquiler = await prisma.category.create({ data: { name: 'Alquileres Exclusivos', slug: 'alquileres-exclusivos', tenantId } });

  await prisma.product.updateMany({
    where: { tenantId },
    data: { isActive: false, isDeleted: true }
  });

  // 1. MANSIÓN EN VENTA
  const mansion = await prisma.product.create({
    data: {
      name: 'Mansión Inteligente al Lago',
      description: 'Arquitectura brutalista y moderna con terminaciones de extrema calidad. Amplios ventanales de piso a techo, domótica centralizada de última generación, piscina infinita revestida en piedra Bali y muelle privado con acceso a embarcación.\n\nIdeal para familias que buscan máxima seguridad y confort en el entorno más exclusivo y reservado de la región.',
      images: [
        'https://images.unsplash.com/photo-1613490900233-141c5560d75d?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2000&auto=format&fit=crop'
      ],
      qr: 'INM-MANSION-VENTA',
      categoryId: catInmueble.id,
      basePrice: 2500000,
      brand: 'Nordelta - Barrio Los Castores',
      condition: 'NEW',
      isNew: true,
      isRecommended: true,
      isTrending: true,
      measurementUnit: 'UNIDAD',
      type: 'Producto',
      tenantId,
      saleMode: 'VENTA',
      characteristics: [
        { key: 'Uso de suelo', value: 'Residencial Exclusivo' },
        { key: 'Ciudad/Zona/Dirección', value: 'Nordelta, Tigre, Buenos Aires - Los Castores Lote 45' },
        { key: 'Mapa interactivo GPS', value: 'https://maps.google.com/?q=-34.402,-58.641' },
        { key: 'Referencias', value: 'Frente al lago principal, a 200m del Club House' },
        { key: 'Área total', value: '1850 m²' },
        { key: 'Área construida', value: '920 m²' },
        { key: 'Frente x Fondo', value: '35m x 52m' },
        { key: 'Forma', value: 'Rectangular Irregular' },
        { key: 'Servicios (agua/luz/calle)', value: 'Todos conectados, Trifásica, Calles asfaltadas' },
        { key: 'Dormitorios', value: '6 (4 en Suite con vestidor)' },
        { key: 'Baños', value: '7' },
        { key: 'Cochera', value: 'Espacio para 5 vehículos (3 cubiertos)' },
        { key: 'Otras características (Cerco, Pozo, etc.)', value: 'Cerco vivo consolidado, Riego por aspersión, Dependencia de servicio doble' },
        { key: 'Estado Legal (Escritura/Trámite)', value: 'Escritura al día, planos aprobados' },
        { key: 'Gravámenes', value: 'Libre de gravámenes e inhibiciones' },
        { key: 'Precio/m²', value: 'U$S 2.717 / m² construido' },
        { key: 'Formas de pago', value: 'Contado. Se aceptan propiedades de menor valor o criptomonedas (USDT/BTC)' },
        { key: 'Plano/Croquis (Enlace)', value: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
        { key: 'Persona encargada', value: 'Lic. Martín Giromini - Agente Premium' }
      ]
    }
  });
  const mansionSku = await prisma.sKU.create({ data: { productId: mansion.id, code: 'SKU-MANSION-VENTA', price: 2500000, tenantId } });
  await prisma.branchInventory.create({ data: { skuId: mansionSku.id, branchId: branch.id, stock: 1, price: 2500000 } });

  // 2. LOTE EN VENTA
  const lote = await prisma.product.create({
    data: {
      name: 'Terreno Frente al Polo',
      description: 'Espectacular lote con orientación Noroeste, garantizando sol durante toda la tarde en el jardín y atardeceres sobre las canchas de polo. Terreno totalmente nivelado, con estudio de suelo realizado y amojonado. Listo para iniciar construcción inmediata.',
      images: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1628611225249-6c478a577f80?q=80&w=2000&auto=format&fit=crop'
      ],
      qr: 'INM-LOTE-POLO',
      categoryId: catLote.id,
      basePrice: 550000,
      brand: 'Pilar - Barrio Centauros',
      condition: 'NEW',
      isNew: false,
      isRecommended: true,
      isTrending: false,
      measurementUnit: 'UNIDAD',
      type: 'Producto',
      tenantId,
      saleMode: 'VENTA',
      characteristics: [
        { key: 'Uso de suelo', value: 'Residencial Unifamiliar' },
        { key: 'Ciudad/Zona/Dirección', value: 'Pilar, Buenos Aires - Barrio Centauros' },
        { key: 'Mapa interactivo GPS', value: 'https://maps.google.com/?q=-34.45,-58.91' },
        { key: 'Referencias', value: 'Lindero a Cancha 1 de Polo' },
        { key: 'Área total', value: '2500 m²' },
        { key: 'Área construida', value: '0 m²' },
        { key: 'Frente x Fondo', value: '45m x 55m' },
        { key: 'Forma', value: 'Cuadrada' },
        { key: 'Servicios (agua/luz/calle)', value: 'Agua, Luz, Gas natural a pie de lote' },
        { key: 'Dormitorios', value: '-' },
        { key: 'Baños', value: '-' },
        { key: 'Cochera', value: '-' },
        { key: 'Otras características (Cerco, Pozo, etc.)', value: 'Alambrado perimetral, Amojonado, Estudio de Suelo incluido' },
        { key: 'Estado Legal (Escritura/Trámite)', value: 'Cesión de Fideicomiso' },
        { key: 'Gravámenes', value: 'Ninguno' },
        { key: 'Precio/m²', value: 'U$S 220 / m²' },
        { key: 'Formas de pago', value: 'Adelanto 50% y saldo en 24 cuotas fijas (dólares)' },
        { key: 'Plano/Croquis (Enlace)', value: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
        { key: 'Persona encargada', value: 'Valeria Solís - Broker Especialista en Terrenos' }
      ]
    }
  });
  const loteSku = await prisma.sKU.create({ data: { productId: lote.id, code: 'SKU-LOTE-POLO', price: 550000, tenantId } });
  await prisma.branchInventory.create({ data: { skuId: loteSku.id, branchId: branch.id, stock: 1, price: 550000 } });

  // 3. PENTHOUSE EN ALQUILER
  const alquiler = await prisma.product.create({
    data: {
      name: 'Penthouse Puerto Madero',
      description: 'Lujosísimo Penthouse en piso 45 con vista panorámica 360° al río y a la ciudad. Completamente amoblado con mobiliario de diseño italiano. Cocina de concepto abierto, cava de vinos climatizada, Master Suite de 120m² con doble baño y vestidores.',
      images: [
        'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=2000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1502005097973-f5a88cda1365?q=80&w=2000&auto=format&fit=crop'
      ],
      qr: 'INM-ALQ-PENTHOUSE',
      categoryId: catAlquiler.id,
      basePrice: 15000,
      brand: 'Puerto Madero - Torre Alvear',
      condition: 'EXHIBITION',
      isNew: true,
      isRecommended: true,
      isTrending: true,
      measurementUnit: 'UNIDAD',
      type: 'Producto',
      tenantId,
      saleMode: 'ALQUILER',
      characteristics: [
        { key: 'Uso de suelo', value: 'Residencial / Corporativo' },
        { key: 'Ciudad/Zona/Dirección', value: 'Puerto Madero, CABA - Azucena Villaflor 100' },
        { key: 'Mapa interactivo GPS', value: 'https://maps.google.com/?q=-34.611,-58.361' },
        { key: 'Referencias', value: 'Piso 45 - Vista directa al Puente de la Mujer' },
        { key: 'Área total', value: '450 m²' },
        { key: 'Área construida', value: '380 m² cubiertos + 70 m² terraza' },
        { key: 'Frente x Fondo', value: '-' },
        { key: 'Forma', value: 'Planta Libre Circular' },
        { key: 'Servicios (agua/luz/calle)', value: 'Climatización central VRV, Internet Dedicado, Grupo Electrógeno' },
        { key: 'Dormitorios', value: '3 en Suite' },
        { key: 'Baños', value: '4 + Toilette de recepción' },
        { key: 'Cochera', value: '3 cocheras subterráneas fijas' },
        { key: 'Otras características (Cerco, Pozo, etc.)', value: 'Amoblado. Amenidades en edificio: Gym, Spa, Helipuerto' },
        { key: 'Estado Legal (Escritura/Trámite)', value: 'Contrato comercial o habitacional' },
        { key: 'Gravámenes', value: '-' },
        { key: 'Precio/m²', value: 'U$S 33 / m² (Mensual)' },
        { key: 'Formas de pago', value: 'Mes por adelantado + 2 meses de depósito. Ajuste semestral.' },
        { key: 'Plano/Croquis (Enlace)', value: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
        { key: 'Persona encargada', value: 'Departamento de Corporativos - Luxury Rentals' }
      ]
    }
  });
  const alquilerSku = await prisma.sKU.create({ data: { productId: alquiler.id, code: 'SKU-ALQ-PENTHOUSE', price: 15000, tenantId } });
  await prisma.branchInventory.create({ data: { skuId: alquilerSku.id, branchId: branch.id, stock: 1, price: 15000 } });

  console.log('Seed completado exitosamente.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
