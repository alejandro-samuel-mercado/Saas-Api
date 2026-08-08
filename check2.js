const prisma = require('./src/config/prisma');
console.log(Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$')));
process.exit(0);
