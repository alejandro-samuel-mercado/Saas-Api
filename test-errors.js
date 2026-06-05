require("dotenv").config();
const prisma = require("./src/config/prisma");
async function main() {
  const errors = await prisma.errorLog.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  });
  console.log("Recent errors:", errors);
}
main().catch(console.error).finally(() => prisma.$disconnect());
