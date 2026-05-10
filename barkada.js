require('dotenv').config();
const fs = require('fs');
const express = require('express');
const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');

// 🌐 EXPRESS SERVER (keep alive for Render)
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Barkada Bot is alive!');
});

app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});

// 🤖 DISCORD CLIENT
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

// 📂 LOAD COMMANDS
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// 📂 LOAD EVENTS
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

// 🚀 AUTO DEPLOY COMMANDS (IMPORTANT FIX)
async function deployCommands() {
  const commands = [];

  const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
  }

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

  try {
    console.log('🚀 Auto deploying commands...');

    await rest.put(
      Routes.applicationGuildCommands('1503153945495736331', '1130118065489723442'),
      { body: commands }
    );

    console.log('✅ Commands deployed!');
  } catch (error) {
    console.error(error);
  }
}

// ✅ READY EVENT
client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  // 🔥 AUTO DEPLOY HERE
  await deployCommands();
});

// 🔐 LOGIN
client.login(process.env.TOKEN);
