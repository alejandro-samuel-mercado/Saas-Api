require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const t = await prisma.tenant.findFirst({ include: { rubro: true } });
  console.log('Current tenant:', t.name);
  console.log('Current rubro:', t.rubro?.name);
  
  const perfumes = await prisma.product.count({ where: { rubroId: 8 } }); // 8 is perfumes from migration output
  console.log('Perfumes count in db:', perfumes);
}
main().finally(() => prisma.$disconnect());
