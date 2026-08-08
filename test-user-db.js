const prisma = require('./src/config/prisma');

async function test() {
  const email = 'barberia@gmail.com';
  
  const users = await prisma.user.findMany({
    where: { email },
    include: { role: true, branch: true }
  });
  
  console.log(`Found ${users.length} users with email ${email}`);
  console.log(JSON.stringify(users, null, 2));

  // Also let's execute the exact global query
  const globalUser = await prisma.user.findFirst({
        where: { 
            email: email,
            role: { name: { in: ['SUPER_ADMIN', 'ADMIN', 'EMPLOYEE'] } }
        },
        include: { role: true }
  });
  console.log('\nGlobal user query result:');
  console.log(JSON.stringify(globalUser, null, 2));
}

test().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
