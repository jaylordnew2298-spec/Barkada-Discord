require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const config = require('./config.json');

// handlers
const handleCommands = require('./includes/handleCommands');
const handleEvents = require('./includes/handleEvents');

// 🌐 EXPRESS
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Barkada Bot is alive!');
});

app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});

// 🤖 CLIENT
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.commands = new Collection();

// LOAD
handleCommands(client);
handleEvents(client);

// PREFIX COMMANDS
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const prefix = config.prefix;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  const command = client.commands.get(cmd);
  if (!command) return;

  try {
    await command.execute(message, args);
  } catch (err) {
    console.error(err);
    message.reply('❌ Error executing command');
  }
});

// LOGIN
client.login(process.env.TOKEN);
