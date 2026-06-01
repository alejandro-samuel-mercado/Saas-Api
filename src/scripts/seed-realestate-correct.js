const prisma = require('../config/prisma');

async function main() {
  console.log('Iniciando seed de Inmobiliaria con el Tenant correcto...');
  const tenantId = '48758d33-947f-4724-afce-17e13f72730a';

  let branch = await prisma.branch.findFirst({ where: { tenantId } });
  if (!branch) {
    branch = await prisma.branch.create({
      data: { name: 'Sucursal Principal', tenantId, address: 'Nordelta', isHeadquarters: true, phone: '1111' }
    });
  }

  let catInmueble = await prisma.category.findFirst({ where: { slug: 'inmuebles-demo-2', tenantId } });
  if (!catInmueble) catInmueble = await prisma.category.create({ data: { name: 'Inmuebles Premium', slug: 'inmuebles-demo-2', tenantId } });

  let catLote = await prisma.category.findFirst({ where: { slug: 'terrenos-demo-2', tenantId } });
  if (!catLote) catLote = await prisma.category.create({ data: { name: 'Terrenos y Lotes', slug: 'terrenos-demo-2', tenantId } });

  let catAlquiler = await prisma.category.findFirst({ where: { slug: 'alquileres-demo-2', tenantId } });
  if (!catAlquiler) catAlquiler = await prisma.category.create({ data: { name: 'Alquileres Exclusivos', slug: 'alquileres-demo-2', tenantId } });

  await prisma.product.updateMany({
    where: { tenantId },
    data: { isActive: false, isDeleted: true }
  });

  // 1. MANSIÓN EN VENTA
  const p1 = await prisma.product.create({
    data: {
      name: 'Mansión Inteligente al Lago',
      description: 'Arquitectura brutalista y moderna con terminaciones de extrema calidad. Amplios ventanales de piso a techo, domótica centralizada de última generación, piscina infinita revestida en piedra Bali.',
      images: ['https://images.unsplash.com/photo-1613490900233-141c5560d75d?q=80&w=2000&auto=format&fit=crop'],
      qr: 'INM-MANSION-DEMO-1', categoryId: catInmueble.id, basePrice: 2500000, brand: 'Nordelta', condition: 'NEW', isNew: true, isRecommended: true, isTrending: true, measurementUnit: 'UNIDAD', type: 'Producto', tenantId, saleMode: 'VENTA',
      characteristics: [
        { key: 'Uso de suelo', value: 'Residencial Exclusivo' }, { key: 'Ciudad/Zona/Dirección', value: 'Nordelta, Tigre' }, { key: 'Área total', value: '1850 m²' }, { key: 'Área construida', value: '920 m²' }, { key: 'Servicios (agua/luz/calle)', value: 'Todos conectados' }, { key: 'Dormitorios', value: '6' }, { key: 'Baños', value: '7' }, { key: 'Cochera', value: '5 vehículos' }, { key: 'Estado Legal (Escritura/Trámite)', value: 'Escritura al día' }, { key: 'Formas de pago', value: 'Contado / Permuta' }
      ]
    }
  });
  let sku1 = await prisma.sKU.create({ data: { productId: p1.id, code: 'SKU-MANSION-D1', price: 2500000, tenantId } });
  await prisma.branchInventory.create({ data: { skuId: sku1.id, branchId: branch.id, stock: 1, price: 2500000 } });

  // 2. CASA MINIMALISTA
  const p2 = await prisma.product.create({
    data: {
      name: 'Casa Minimalista en Puertos',
      description: 'Diseño vanguardista con integración absoluta del interior y exterior. Galería con losa radiante, fogonero hundido y muelle propio.',
      images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000&auto=format&fit=crop'],
      qr: 'INM-CASA-DEMO-2', categoryId: catInmueble.id, basePrice: 850000, brand: 'Puertos Escobar', condition: 'NEW', isNew: true, isRecommended: true, isTrending: false, measurementUnit: 'UNIDAD', type: 'Producto', tenantId, saleMode: 'VENTA',
      characteristics: [
        { key: 'Uso de suelo', value: 'Residencial' }, { key: 'Ciudad/Zona/Dirección', value: 'Puertos del Lago, Escobar' }, { key: 'Área total', value: '1100 m²' }, { key: 'Área construida', value: '340 m²' }, { key: 'Dormitorios', value: '4' }, { key: 'Baños', value: '5' }, { key: 'Estado Legal (Escritura/Trámite)', value: 'Cesión de Fideicomiso' }, { key: 'Formas de pago', value: 'Financiación directa' }
      ]
    }
  });
  let sku2 = await prisma.sKU.create({ data: { productId: p2.id, code: 'SKU-CASA-D2', price: 850000, tenantId } });
  await prisma.branchInventory.create({ data: { skuId: sku2.id, branchId: branch.id, stock: 1, price: 850000 } });

  // 3. PENTHOUSE ALQUILER
  const p3 = await prisma.product.create({
    data: {
      name: 'Penthouse Puerto Madero',
      description: 'Lujosísimo Penthouse con vista panorámica 360° al río y a la ciudad. Amoblado con mobiliario italiano.',
      images: ['https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=2000&auto=format&fit=crop'],
      qr: 'INM-ALQ-DEMO-3', categoryId: catAlquiler.id, basePrice: 15000, brand: 'Puerto Madero', condition: 'EXHIBITION', isNew: true, isRecommended: true, isTrending: true, measurementUnit: 'UNIDAD', type: 'Producto', tenantId, saleMode: 'ALQUILER',
      characteristics: [
        { key: 'Uso de suelo', value: 'Corporativo / Habitacional' }, { key: 'Ciudad/Zona/Dirección', value: 'Puerto Madero, CABA' }, { key: 'Área total', value: '450 m²' }, { key: 'Dormitorios', value: '3 en Suite' }, { key: 'Baños', value: '4' }, { key: 'Cochera', value: '3 fijas' }, { key: 'Estado Legal (Escritura/Trámite)', value: 'Contrato comercial' }, { key: 'Formas de pago', value: 'Mes adelantado + Depósito' }
      ]
    }
  });
  let sku3 = await prisma.sKU.create({ data: { productId: p3.id, code: 'SKU-ALQ-D3', price: 15000, tenantId } });
  await prisma.branchInventory.create({ data: { skuId: sku3.id, branchId: branch.id, stock: 1, price: 15000 } });

  // 4. DEPARTAMENTO BOUTIQUE ALQUILER
  const p4 = await prisma.product.create({
    data: {
      name: 'Loft Boutique Palermo Soho',
      description: 'Loft estilo neoyorquino reciclado a nuevo en plena zona de diseño de Palermo Soho. Paredes de ladrillo visto, doble altura y terraza privada.',
      images: ['https://images.unsplash.com/photo-1502005097973-f5a88cda1365?q=80&w=2000&auto=format&fit=crop'],
      qr: 'INM-ALQ-DEMO-4', categoryId: catAlquiler.id, basePrice: 2200, brand: 'Palermo Soho', condition: 'REFURBISHED', isNew: false, isRecommended: false, isTrending: true, measurementUnit: 'UNIDAD', type: 'Producto', tenantId, saleMode: 'ALQUILER',
      characteristics: [
        { key: 'Uso de suelo', value: 'Apto Profesional' }, { key: 'Ciudad/Zona/Dirección', value: 'Palermo Soho, CABA' }, { key: 'Área total', value: '120 m²' }, { key: 'Dormitorios', value: '1 (Loft)' }, { key: 'Baños', value: '2' }, { key: 'Cochera', value: 'No posee' }, { key: 'Estado Legal (Escritura/Trámite)', value: 'Contrato temporario' }, { key: 'Formas de pago', value: 'Paquete con expensas incluidas' }
      ]
    }
  });
  let sku4 = await prisma.sKU.create({ data: { productId: p4.id, code: 'SKU-ALQ-D4', price: 2200, tenantId } });
  await prisma.branchInventory.create({ data: { skuId: sku4.id, branchId: branch.id, stock: 1, price: 2200 } });

  // 5. LOTE EN VENTA
  const p5 = await prisma.product.create({
    data: {
      name: 'Terreno Frente al Polo',
      description: 'Espectacular lote con orientación Noroeste, garantizando sol durante toda la tarde. Terreno totalmente nivelado.',
      images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop'],
      qr: 'INM-LOTE-DEMO-5', categoryId: catLote.id, basePrice: 550000, brand: 'Pilar', condition: 'NEW', isNew: true, isRecommended: true, isTrending: false, measurementUnit: 'UNIDAD', type: 'Producto', tenantId, saleMode: 'VENTA',
      characteristics: [
        { key: 'Uso de suelo', value: 'Residencial Unifamiliar' }, { key: 'Ciudad/Zona/Dirección', value: 'Pilar, Buenos Aires' }, { key: 'Área total', value: '2500 m²' }, { key: 'Servicios (agua/luz/calle)', value: 'Agua, Luz, Gas natural' }, { key: 'Otras características (Cerco, Pozo, etc.)', value: 'Alambrado perimetral, Amojonado' }, { key: 'Estado Legal (Escritura/Trámite)', value: 'Escritura' }, { key: 'Formas de pago', value: 'Financiación 24 meses' }
      ]
    }
  });
  let sku5 = await prisma.sKU.create({ data: { productId: p5.id, code: 'SKU-LOTE-D5', price: 550000, tenantId } });
  await prisma.branchInventory.create({ data: { skuId: sku5.id, branchId: branch.id, stock: 1, price: 550000 } });

  console.log('Seed COMPLETADO EXITOSAMENTE en el tenant: ', tenantId);
}

main().catch(e => {
  console.log("================ ERROR ================");
  console.log(e.message);
}).finally(() => prisma.$disconnect());
