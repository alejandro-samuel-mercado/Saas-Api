const prisma = require('./src/config/prisma.js');

async function check() {
  const tenants = await prisma.tenant.findMany();
  console.log(`Found ${tenants.length} tenants.`);
  
  for (const tenant of tenants) {
    const user = await prisma.user.findFirst({
      where: {
        email: tenant.ownerEmail,
        tenantId: tenant.slug
      }
    });

    const userById = await prisma.user.findFirst({
      where: {
        email: tenant.ownerEmail,
        tenantId: tenant.id 
      }
    });

    const anyUser = await prisma.user.findFirst({
      where: {
        email: tenant.ownerEmail
      }
    });

    if (user || userById) {
      console.log(`[OK] Tenant: ${tenant.slug}, Owner Email: ${tenant.ownerEmail}. User found (tenantId: ${user ? tenant.slug : tenant.id}).`);
    } else if (anyUser) {
      console.log(`[MISMATCH] Tenant: ${tenant.slug}, Owner Email: ${tenant.ownerEmail}. User found but with tenantId = ${anyUser.tenantId} (expected ${tenant.slug} or ${tenant.id}).`);
    } else {
      console.log(`[MISSING] Tenant: ${tenant.slug}, Owner Email: ${tenant.ownerEmail}. User NOT FOUND for this email anywhere.`);
    }
  }
}

check().catch(e => {
  console.error(e);
}).finally(() => {
  // Try to end pool connection if any
  process.exit(0);
});
