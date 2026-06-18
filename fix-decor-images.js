const prisma = require('./src/config/prisma.js');

const images = [
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1583847268964-b28ce8fba106?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1600210491369-e753d80a41f3?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1618220179428-22790b46a014?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1617806118233-18e1c0945594?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1582582621959-48d27397dc69?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=800"
];

async function main() {
  const products = await prisma.product.findMany({
    where: { 
      tenantId: '48758d33-947f-4724-afce-17e13f72730a',
      name: { startsWith: 'Decor VIP' }
    }
  });

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const newImage = images[i % images.length];
    
    await prisma.product.update({
      where: { id: p.id },
      data: { images: [newImage] }
    });
  }
  console.log(`Updated ${products.length} products with diverse images.`);
}
main().catch(console.error).finally(() => process.exit(0));
