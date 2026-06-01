const prisma = require('./src/config/prisma');

async function main() {
  const tenantId = '48758d33-947f-4724-afce-17e13f72730a';
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  
  if (!tenant) {
      console.log('Tenant not found');
      return;
  }
  
  const superAdminRole = await prisma.role.findFirst({ where: { tenantId, name: 'SUPER_ADMIN' } });
  
  if (superAdminRole) {
    const users = await prisma.user.findMany({ where: { tenantId, roleId: superAdminRole.id } });
    console.log('Super Admins found:', users.map(u => u.email));
    
    // Update the first super admin to match the tenant's current ownerEmail
    if (users.length > 0 && users[0].email !== tenant.ownerEmail) {
        console.log(`Updating SUPER_ADMIN email from ${users[0].email} to ${tenant.ownerEmail}`);
        await prisma.user.update({
            where: { id: users[0].id },
            data: { email: tenant.ownerEmail }
        });
        console.log('Updated successfully!');
    } else {
        console.log('No update needed or no users found.');
    }
  } else {
    console.log('No SUPER_ADMIN role found for this tenant!');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
