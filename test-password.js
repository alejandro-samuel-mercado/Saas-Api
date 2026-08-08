const bcrypt = require('bcrypt');
async function test() {
  const hash = '$2b$10$/EH5RCaPYq/EiCjFmDXZEupCH/immtjzbgM1b9CyPmt9kfd0JG4.y';
  console.log(await bcrypt.compare('admin123', hash));
}
test();
