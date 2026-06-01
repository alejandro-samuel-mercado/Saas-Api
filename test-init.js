const prisma = require('./src/config/prisma');
const saasService = require('./src/services/saas.service');

async function main() {
  try {
    const tenantId = '48758d33-947f-4724-afce-17e13f72730a';
    console.log('Initializing tenant manually...');
    await saasService.initializeTenant(tenantId, 'admin123');
    console.log('Success!');
  } catch (err) {
    console.error('Error initializing tenant:', err);
  }
}

main().finally(() => prisma.$disconnect());
