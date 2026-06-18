const prisma = require('./src/config/prisma.js');
async function main() {
  const rubros = await prisma.rubro.findMany();
  console.log(rubros.map(r => r.slug));
}
main().finally(() => process.exit(0));
