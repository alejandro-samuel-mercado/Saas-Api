const prisma = require('./src/config/prisma');
const bcrypt = require('bcryptjs');

async function main() {
  try {
    const tenantId = '48758d33-947f-4724-afce-17e13f72730a';
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    
    // Ensure SUPER_ADMIN role exists
    let role = await prisma.role.findFirst({ where: { tenantId, name: 'SUPER_ADMIN' } });
    if (!role) {
        role = await prisma.role.create({
            data: { tenantId, name: 'SUPER_ADMIN', description: 'SUPER_ADMIN' }
        });
    }

    // Ensure Branch exists
    let branch = await prisma.branch.findFirst({ where: { tenantId, isHeadquarters: true } });
    if (!branch) {
        branch = await prisma.branch.create({
            data: {
                tenantId, name: 'Sucursal Principal', code: 'MAIN', address: '-', city: '-', state: '-', country: '-',
                phone: '-', operatingHours: {}, isHeadquarters: true
            }
        });
    }

    // Ensure User exists
    let user = await prisma.user.findFirst({ where: { tenantId, email: tenant.ownerEmail } });
    if (!user) {
        const hashedPassword = await bcrypt.hash(tenant.ownerPassword || 'admin123', 10);
        user = await prisma.user.create({
            data: {
                tenantId,
                name: tenant.ownerName,
                email: tenant.ownerEmail,
                password: hashedPassword,
                roleId: role.id,
                branchId: branch.id,
                status: 'ACTIVE',
                emailVerified: true
            }
        });
        console.log('User created successfully:', user.email);
    } else {
        console.log('User already exists:', user.email);
        // Ensure password and role are correct
        const hashedPassword = await bcrypt.hash(tenant.ownerPassword || 'admin123', 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword, roleId: role.id }
        });
        console.log('Updated user password to match tenant ownerPassword');
    }

  } catch (err) {
    console.error('Error fixing tenant:', err);
  }
}

main().finally(() => prisma.$disconnect());
