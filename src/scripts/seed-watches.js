const prisma = require('../config/prisma');

async function main() {
  const tenantId = 'f36407d2-847e-4b0a-a63c-7bfc279b1642';
  console.log('Seeding 20 productos de relojes para tenant:', tenantId);

  let branch = await prisma.branch.findFirst({ where: { tenantId } });
  if (!branch) {
    branch = await prisma.branch.create({
      data: {
        name: 'Local Principal', code: 'LOC-01', tenantId,
        address: 'Av. Santa Fe 1234', city: 'Buenos Aires',
        state: 'Buenos Aires', country: 'Argentina',
        phone: '011-4444-5555', isHeadquarters: true,
        operatingHours: { lunes: { open: '10:00', close: '20:00' }, martes: { open: '10:00', close: '20:00' } }
      }
    });
  }

  const cats = {};
  const catDefs = [
    { name: 'Relojes de Lujo', slug: 'relojes-lujo-watch' },
    { name: 'Relojes Sport', slug: 'relojes-sport-watch' },
    { name: 'Smartwatch', slug: 'smartwatch-watch' },
    { name: 'Accesorios', slug: 'accesorios-reloj-watch' },
  ];
  for (const c of catDefs) {
    let cat = await prisma.category.findFirst({ where: { slug: c.slug, tenantId } });
    if (!cat) cat = await prisma.category.create({ data: { name: c.name, slug: c.slug, tenantId } });
    cats[c.slug] = cat;
  }

  const products = [
    {
      name: 'Rolex Submariner Date 41mm',
      description: 'Ícono de la relojería suiza. Caja y brazalete Oyster en acero Oystersteel. Movimiento calibre 3235 automático de manufactura Rolex. Resistente al agua hasta 300 metros.',
      images: ['https://images.unsplash.com/photo-1548171915-b4e6d285f8f0?auto=format&fit=crop&q=80&w=800'],
      categorySlug: 'relojes-lujo-watch', price: 1850000, brand: 'Rolex',
      isNew: true, isTrending: true, isRecommended: true,
      chars: [{ key: 'Movimiento', value: 'Automático Cal. 3235' }, { key: 'Diámetro', value: '41 mm' }, { key: 'Material caja', value: 'Acero Oystersteel 904L' }, { key: 'Resistencia al agua', value: '300 m' }, { key: 'Garantía', value: '5 años oficial' }]
    },
    {
      name: 'Omega Seamaster 300M 43.5mm',
      description: 'El reloj de buceo favorito del cine. Bisel de cerámica negro, fondo de cuerda azul coaxial. Calibre 8800 Master Chronometer certificado METAS.',
      images: ['https://images.unsplash.com/photo-1526045612212-70caf35c14df?auto=format&fit=crop&q=80&w=800'],
      categorySlug: 'relojes-lujo-watch', price: 820000, brand: 'Omega',
      isNew: true, isTrending: true, isRecommended: false,
      chars: [{ key: 'Movimiento', value: 'Automático Cal. 8800' }, { key: 'Diámetro', value: '43.5 mm' }, { key: 'Bisel', value: 'Cerámica negra' }, { key: 'Resistencia al agua', value: '300 m' }, { key: 'Certificación', value: 'Master Chronometer METAS' }]
    },
    {
      name: 'TAG Heuer Carrera Cronógrafo 44mm',
      description: 'El cronógrafo del automovilismo de alta competición. Calibre Heuer 01 automático. Caja de titanio con detalles en negro. Edición especial con esfera esqueleto.',
      images: ['https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&q=80&w=800'],
      categorySlug: 'relojes-lujo-watch', price: 650000, brand: 'TAG Heuer',
      isNew: false, isTrending: true, isRecommended: true,
      chars: [{ key: 'Movimiento', value: 'Automático Heuer 01' }, { key: 'Diámetro', value: '44 mm' }, { key: 'Material caja', value: 'Titanio' }, { key: 'Funciones', value: 'Cronógrafo, fecha' }, { key: 'Correa', value: 'Cuero negro perforado' }]
    },
    {
      name: 'IWC Portugieser Automático 42mm',
      description: 'Elegancia atemporal de la maison suiza de Schaffhausen. Esfera blanca con indicadores azules, movimiento calibre 52110 con reserva de marcha de 7 días.',
      images: ['https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&q=80&w=800'],
      categorySlug: 'relojes-lujo-watch', price: 1200000, brand: 'IWC',
      isNew: false, isTrending: false, isRecommended: true,
      chars: [{ key: 'Movimiento', value: 'Automático Cal. 52110' }, { key: 'Diámetro', value: '42 mm' }, { key: 'Reserva de marcha', value: '7 días' }, { key: 'Cristal', value: 'Zafiro antirreflejo' }, { key: 'Correa', value: 'Cuero de aligátor marrón' }]
    },
    {
      name: 'Longines HydroConquest GMT 41mm',
      description: 'Precisión suiza a precio accesible. Funcionalidad GMT con bisel rotatorio. Movimiento L3.890.4 automático con COSC. Ideal para viajeros frecuentes.',
      images: ['https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=800'],
      categorySlug: 'relojes-lujo-watch', price: 320000, brand: 'Longines',
      isNew: true, isTrending: false, isRecommended: false,
      chars: [{ key: 'Movimiento', value: 'Automático L3.890.4' }, { key: 'Diámetro', value: '41 mm' }, { key: 'Función GMT', value: 'Sí' }, { key: 'Resistencia al agua', value: '300 m' }, { key: 'Certificación', value: 'COSC Chronometer' }]
    },
    {
      name: 'Casio G-Shock GWF-A1000 Frogman',
      description: 'El rey del buceo en el mundo G-Shock. Sumergible hasta 200m, con indicador de profundidad, temperatura, termómetro y brújula. Movimiento solar + radio-controlado.',
      images: ['https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800'],
      categorySlug: 'relojes-sport-watch', price: 185000, brand: 'Casio',
      isNew: true, isTrending: true, isRecommended: false,
      chars: [{ key: 'Movimiento', value: 'Cuarzo Solar / Radio-controlado' }, { key: 'Resistencia al agua', value: '200 m' }, { key: 'Funciones', value: 'Profundímetro, termómetro, brújula' }, { key: 'Material', value: 'Resina + fibra de carbono' }, { key: 'Batería', value: 'Solar' }]
    },
    {
      name: 'Seiko Prospex Turtle Automático',
      description: 'Reencarnación del clásico reloj de buceo de 1968. Automatico Cal. 6R35 con 70h de reserva. Bisel de polietileno negro, caja de acero. Icónico en todo el mundo.',
      images: ['https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?auto=format&fit=crop&q=80&w=800'],
      categorySlug: 'relojes-sport-watch', price: 98000, brand: 'Seiko',
      isNew: false, isTrending: false, isRecommended: true,
      chars: [{ key: 'Movimiento', value: 'Automático Cal. 6R35' }, { key: 'Reserva de marcha', value: '70 horas' }, { key: 'Resistencia al agua', value: '200 m' }, { key: 'Diámetro', value: '44 mm' }, { key: 'Bisel', value: 'Polietileno unidireccional' }]
    },
    {
      name: 'Garmin Fenix 7X Sapphire Solar',
      description: 'Reloj GPS multideporte con carga solar. Pantalla de cristal de zafiro, métricas avanzadas de salud, mapas TopoActive incluidos, autonomía hasta 37 días.',
      images: ['https://images.unsplash.com/photo-1544117519-31a4b719223d?auto=format&fit=crop&q=80&w=800'],
      categorySlug: 'smartwatch-watch', price: 390000, brand: 'Garmin',
      isNew: true, isTrending: true, isRecommended: true,
      chars: [{ key: 'Tipo', value: 'GPS Multideporte Solar' }, { key: 'Autonomía', value: 'Hasta 37 días' }, { key: 'Pantalla', value: 'Cristal de zafiro' }, { key: 'Mapas', value: 'TopoActive incluidos' }, { key: 'Resistencia al agua', value: '100 m' }]
    },
    {
      name: 'Apple Watch Ultra 2 Titanio',
      description: 'El Apple Watch más robusto jamás fabricado. Caja de titanio aeroespacial, pantalla más brillante, GPS L1+L2 de doble frecuencia, botón de acción personalizable.',
      images: ['https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&q=80&w=800'],
      categorySlug: 'smartwatch-watch', price: 450000, brand: 'Apple',
      isNew: true, isTrending: true, isRecommended: false,
      chars: [{ key: 'Material caja', value: 'Titanio aeroespacial' }, { key: 'Pantalla', value: 'LTPO OLED 2000 nits' }, { key: 'GPS', value: 'L1+L2 doble frecuencia' }, { key: 'Resistencia al agua', value: '100 m (EN 13319)' }, { key: 'Autonomía', value: '36 horas típicas' }]
    },
    {
      name: 'Samsung Galaxy Watch 7 Pro 47mm',
      description: 'Diseño premium en titanio. Pantalla Sapphire Crystal. Monitoreo avanzado de salud con BioActive Sensor, ECG, presión arterial y detección de glucosa.',
      images: ['https://images.unsplash.com/photo-1551816230-ef5deaed4a26?auto=format&fit=crop&q=80&w=800'],
      categorySlug: 'smartwatch-watch', price: 280000, brand: 'Samsung',
      isNew: false, isTrending: false, isRecommended: true,
      chars: [{ key: 'Material caja', value: 'Titanio grado 4' }, { key: 'Pantalla', value: 'Cristal de zafiro' }, { key: 'Sensores', value: 'BioActive, ECG, presión arterial' }, { key: 'Resistencia al agua', value: '10 ATM / MIL-STD-810H' }, { key: 'Autonomía', value: 'Hasta 60 horas' }]
    },
    {
      name: 'Tissot PRX Powermatic 80',
      description: 'Diseño integrado icónico de los años 70, reversionado con tecnología moderna. Movimiento automático con 80 horas de reserva. Esfera azul sunray con índices dorados.',
      images: ['https://images.unsplash.com/photo-1633367539716-a6a3e1e81649?auto=format&fit=crop&q=80&w=800'],
      categorySlug: 'relojes-lujo-watch', price: 175000, brand: 'Tissot',
      isNew: false, isTrending: false, isRecommended: true,
      chars: [{ key: 'Movimiento', value: 'Automático ETA C07.111' }, { key: 'Reserva de marcha', value: '80 horas' }, { key: 'Diámetro', value: '40 mm' }, { key: 'Material', value: 'Acero inoxidable' }, { key: 'Resistencia al agua', value: '100 m' }]
    },
    {
      name: 'Hamilton Khaki Field Automático 42mm',
      description: 'El reloj del ejército americano con raíces suizas. Robusto, legible y preciso. Calibre H-10 automático con 80 horas de reserva. Un ícono militar.',
      images: ['https://images.unsplash.com/photo-1579656592043-a20e25a4aa4b?auto=format&fit=crop&q=80&w=800'],
      categorySlug: 'relojes-sport-watch', price: 195000, brand: 'Hamilton',
      isNew: true, isTrending: false, isRecommended: false,
      chars: [{ key: 'Movimiento', value: 'Automático H-10' }, { key: 'Reserva de marcha', value: '80 horas' }, { key: 'Diámetro', value: '42 mm' }, { key: 'Cristal', value: 'Zafiro antirreflejo' }, { key: 'Correa', value: 'Nylon khaki' }]
    },
    {
      name: 'Citizen Promaster Eco-Drive Satellite Wave',
      description: 'Tecnología japonesa de vanguardia. Recepción satelital GPS en 3 segundos en cualquier parte del mundo. Sin necesidad de cambiar pilas. Solar 100%.',
      images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800'],
      categorySlug: 'relojes-sport-watch', price: 215000, brand: 'Citizen',
      isNew: false, isTrending: true, isRecommended: false,
      chars: [{ key: 'Movimiento', value: 'Eco-Drive Satellite Wave' }, { key: 'Sincronización', value: 'GPS satelital global' }, { key: 'Batería', value: 'Solar (sin cambio de pila)' }, { key: 'Diámetro', value: '47 mm' }, { key: 'Resistencia al agua', value: '200 m' }]
    },
    {
      name: 'Malla Milanese Acero Plateada 20mm',
      description: 'Malla milanesa de acero inoxidable 316L trenzada a mano. Compatible con todos los relojes de 20mm. Cierre ajustable magnético. Acabado cepillado y pulido.',
      images: ['https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&q=80&w=800'],
      categorySlug: 'accesorios-reloj-watch', price: 18500, brand: 'Genérico',
      isNew: false, isTrending: false, isRecommended: true,
      chars: [{ key: 'Material', value: 'Acero inoxidable 316L' }, { key: 'Ancho', value: '20 mm' }, { key: 'Cierre', value: 'Magnético ajustable' }, { key: 'Acabado', value: 'Cepillado + pulido' }, { key: 'Compatibilidad', value: 'Relojes de 20mm de ancho de pulsera' }]
    },
    {
      name: 'Correa Cuero Marrón Cosida 22mm',
      description: 'Correa artesanal de cuero genuino cosida a mano. Acabado marrón tabaco con costuras beige. Hebilla de mariposa en acero dorado. Para relojes de 22mm.',
      images: ['https://images.unsplash.com/photo-1586495777744-4e6232bf4796?auto=format&fit=crop&q=80&w=800'],
      categorySlug: 'accesorios-reloj-watch', price: 12000, brand: 'Genérico',
      isNew: true, isTrending: false, isRecommended: false,
      chars: [{ key: 'Material', value: 'Cuero genuino cosido a mano' }, { key: 'Ancho', value: '22 mm' }, { key: 'Hebilla', value: 'Mariposa acero dorado' }, { key: 'Color', value: 'Marrón tabaco' }, { key: 'Costuras', value: 'Beige' }]
    },
    {
      name: 'Estuche para Relojes 6 Posiciones',
      description: 'Estuche de madera laqueada con interior de terciopelo negro. 6 posiciones acolchadas, tapa con espejo, cierre magnético. Ideal para coleccionistas.',
      images: ['https://images.unsplash.com/photo-1526045431048-f857369baa09?auto=format&fit=crop&q=80&w=800'],
      categorySlug: 'accesorios-reloj-watch', price: 28000, brand: 'Genérico',
      isNew: false, isTrending: false, isRecommended: true,
      chars: [{ key: 'Capacidad', value: '6 relojes' }, { key: 'Material exterior', value: 'Madera laqueada' }, { key: 'Interior', value: 'Terciopelo negro' }, { key: 'Extras', value: 'Espejo, cierre magnético' }, { key: 'Dimensiones', value: '35 x 20 x 10 cm' }]
    },
    {
      name: 'Bulova Precisionist Cronógrafo 46mm',
      description: 'El cuarzo más preciso del mercado. Tecnología Precisionist de 3 Hz. Esfera azul sunray, cronógrafo troteur de 1/1000 de segundo. Brazalete de acero pulido.',
      images: ['https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format&fit=crop&q=80&w=800'],
      categorySlug: 'relojes-sport-watch', price: 145000, brand: 'Bulova',
      isNew: false, isTrending: false, isRecommended: false,
      chars: [{ key: 'Movimiento', value: 'Cuarzo Precisionist 3 Hz' }, { key: 'Diámetro', value: '46 mm' }, { key: 'Funciones', value: 'Cronógrafo 1/1000 seg' }, { key: 'Esfera', value: 'Azul sunray' }, { key: 'Resistencia al agua', value: '100 m' }]
    },
    {
      name: 'Fossil Carlyle Automático 45mm',
      description: 'Automatico accesible con esfera esqueleto que muestra el movimiento en acción. Acabados en acero pulido y cepillado. Reloj fashion con corazón mecánico.',
      images: ['https://images.unsplash.com/photo-1542496658-e33a6d0d4c0b?auto=format&fit=crop&q=80&w=800'],
      categorySlug: 'relojes-sport-watch', price: 65000, brand: 'Fossil',
      isNew: false, isTrending: true, isRecommended: false,
      chars: [{ key: 'Movimiento', value: 'Automático' }, { key: 'Esfera', value: 'Esqueleto' }, { key: 'Diámetro', value: '45 mm' }, { key: 'Material', value: 'Acero inoxidable' }, { key: 'Resistencia al agua', value: '50 m' }]
    },
    {
      name: 'Cargador Inalámbrico Universal Relojes',
      description: 'Cargador inalámbrico Qi compatible con Apple Watch, Galaxy Watch, Garmin y otros smartwatches. Incluye cable USB-C. Carga rápida 15W. Diseño compacto de viaje.',
      images: ['https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80&w=800'],
      categorySlug: 'accesorios-reloj-watch', price: 22000, brand: 'Genérico',
      isNew: true, isTrending: false, isRecommended: false,
      chars: [{ key: 'Compatibilidad', value: 'Apple Watch, Galaxy Watch, Garmin' }, { key: 'Potencia', value: '15W carga rápida' }, { key: 'Tecnología', value: 'Qi inalámbrico' }, { key: 'Cable', value: 'USB-C incluido' }, { key: 'Dimensiones', value: 'Compacto (8 cm diámetro)' }]
    },
    {
      name: 'Orient Bambino Classic v2 Automático',
      description: 'El clásico japonés de vestir más vendido. Movimiento automático japonés F6724 con fecha. Esfera blanca con horas romanas, caja de acero 40mm.',
      images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800'],
      categorySlug: 'relojes-lujo-watch', price: 58000, brand: 'Orient',
      isNew: true, isTrending: false, isRecommended: true,
      chars: [{ key: 'Movimiento', value: 'Automático F6724' }, { key: 'Diámetro', value: '40 mm' }, { key: 'Esfera', value: 'Blanca con números romanos' }, { key: 'Resistencia al agua', value: '30 m' }, { key: 'Cristal', value: 'Mineral curvo' }]
    },
  ];

  let created = 0;
  for (const p of products) {
    const cat = cats[p.categorySlug];
    if (!cat) { console.log('Cat not found:', p.categorySlug); continue; }

    const existing = await prisma.product.findFirst({ where: { name: p.name, tenantId } });
    if (existing) { console.log('Ya existe:', p.name); continue; }

    const product = await prisma.product.create({
      data: {
        name: p.name,
        description: p.description,
        images: p.images,
        categoryId: cat.id,
        basePrice: p.price,
        brand: p.brand,
        condition: 'NEW',
        isNew: p.isNew,
        isTrending: p.isTrending,
        isRecommended: p.isRecommended,
        isActive: true,
        measurementUnit: 'UNIDAD',
        type: 'Producto',
        tenantId,
        qr: `WATCH-${Date.now()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`,
        characteristics: p.chars,
      }
    });

    const sku = await prisma.sKU.create({
      data: {
        productId: product.id,
        code: `SKU-W-${product.id}`,
        price: p.price,
        tenantId,
      }
    });

    await prisma.branchInventory.create({
      data: {
        skuId: sku.id,
        branchId: branch.id,
        stock: Math.floor(Math.random() * 8) + 2,
        price: p.price,
        isActive: true,
      }
    });

    created++;
    console.log(`✓ ${p.name} — $${p.price.toLocaleString()}`);
  }

  console.log(`\n✅ Seed completo: ${created} productos creados para el tenant de Relojes.`);
}

main().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
}).finally(() => prisma.$disconnect());
