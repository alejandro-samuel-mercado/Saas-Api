require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const tenant = await prisma.tenant.findFirst();
  const perfumesRubro = await prisma.rubro.findUnique({ where: { slug: 'perfumes' } });
  
  if (tenant && perfumesRubro) {
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { rubroId: perfumesRubro.id }
    });
    console.log('Tenant changed to Perfumes successfully!');
  }
}
main().finally(() => prisma.$disconnect());
