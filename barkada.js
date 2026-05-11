require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const config = require('./config.json');

// 🎵 MUSIC PLAYER
const musicPlayer = require('./music/player');

// handlers
const handleCommands = require('./includes/handleCommands');
const handleEvents = require('./includes/handleEvents');

// 🌐 EXPRESS (Render keep alive)
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
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,      // join/leave logs
    GatewayIntentBits.GuildVoiceStates   // 🔥 REQUIRED FOR MUSIC
  ]
});

client.commands = new Collection();

// 📦 LOAD COMMANDS & EVENTS
handleCommands(client);
handleEvents(client);

// ✅ READY EVENT
client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);

  // 🎵 INIT MUSIC SYSTEM
  musicPlayer.init(client);
});

// 💬 PREFIX COMMAND HANDLER
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

// 🔐 LOGIN
client.login(process.env.TOKEN);
