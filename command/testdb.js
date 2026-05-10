const { SlashCommandBuilder } = require('discord.js');
const db = require('../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('testdb')
    .setDescription('Test Firebase database'),

  async execute(interaction) {
    const userId = interaction.user.id;

    // save data
    await db.setData(`users/${userId}`, {
      name: interaction.user.username,
      coins: 100
    });

    // get data
    const data = await db.getData(`users/${userId}`);

    if (!data) {
      return interaction.reply('❌ No data found');
    }

    await interaction.reply(
      `✅ Saved!\n👤 Name: ${data.name}\n💰 Coins: ${data.coins}`
    );
  }
};
