require("dotenv").config();
const prisma = require("./src/config/prisma");
async function main() {
  const errors = await prisma.errorLog.findMany({
    take: 2,
    orderBy: { createdAt: 'desc' }
  });
  console.log("Latest errors:", errors.map(e => ({
    url: e.context?.url,
    message: e.message,
    date: e.createdAt
  })));
}
main().catch(console.error).finally(() => prisma.$disconnect());
