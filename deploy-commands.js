require('dotenv').config();
const fs = require('fs');
const { REST, Routes } = require('discord.js');

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// ⚠️ PALITAN MO ITO
const CLIENT_ID = '1503153945495736331';
const GUILD_ID = '1130118065489723442';

(async () => {
  try {
    console.log('🚀 Deploying slash commands...');

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log('✅ Successfully deployed commands!');
  } catch (error) {
    console.error(error);
  }
})();
