const { Events } = require('discord.js');

// 🔧 CONFIG
const REACTIONS = ['✅', '❌, '❤', '🤣'];

module.exports = {
  name: Events.MessageCreate,

  /**
   * @param {import('discord.js').Message} message
   */
  async execute(message) {
    // Ignore bot messages
    if (message.author.bot) return;

    // Ignore DMs
    if (!message.guild) return;

    try {
      // Add reactions
      for (const emoji of REACTIONS) {
        await message.react(emoji);
      }
    } catch (error) {
      console.error('❌ Failed to react to message:', error);
    }
  }
};