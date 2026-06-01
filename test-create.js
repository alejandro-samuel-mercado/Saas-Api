const SaaSService = require('./src/services/saas.service');
const prisma = require('./src/config/prisma');

async function test() {
  try {
    const data = {
      name: "Test Tenant 123",
      slug: "test-tenant-123",
      ownerName: "Alejandro",
      ownerEmail: "ale@test.com",
      ownerPhone: "",
      domain: "",
      planId: 1,
      monthlyPrice: 5000,
      subscriptionEnd: "2026-06-25",
      notes: ""
    };
    const res = await SaaSService.createTenant(data);
    console.log("SUCCESS:", res);
  } catch (err) {
    console.error("ERROR:");
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
