const fs = require('fs');

module.exports = (client) => {
  const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

  let loaded = 0;

  for (const file of commandFiles) {
    const command = require(`../commands/${file}`);

    // 🔥 SLASH COMMAND
    if (command.data && command.data.name) {
      client.commands.set(command.data.name, command);
      loaded++;
      continue;
    }

    // 🔥 PREFIX COMMAND
    if (command.name) {
      client.commands.set(command.name, command);
      loaded++;
      continue;
    }

    console.log(`❌ Invalid command: ${file}`);
  }

  console.log(`✅ Loaded ${loaded} commands`);
};
