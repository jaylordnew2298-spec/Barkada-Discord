const {
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

const LOG_CHANNEL = '1320185387255332954';

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.isButton()) return;

    // 🎫 CREATE TICKET
    if (interaction.customId === 'create_ticket') {

      const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionFlagsBits.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
          }
        ]
      });

      const embed = new EmbedBuilder()
        .setColor('#00ffcc')
        .setTitle('🎫 Ticket Created')
        .setDescription('Support will assist you shortly.');

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('close_ticket')
          .setLabel('🔒 Close Ticket')
          .setStyle(ButtonStyle.Danger)
      );

      await channel.send({
        content: `<@${interaction.user.id}>`,
        embeds: [embed],
        components: [row]
      });

      await interaction.reply({
        content: `✅ Your ticket: ${channel}`,
        ephemeral: true
      });
    }

    // 🔒 CLOSE TICKET
    if (interaction.customId === 'close_ticket') {

      const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL);

      if (logChannel) {
        logChannel.send(
          `📁 Ticket closed: ${interaction.channel.name} by <@${interaction.user.id}>`
        );
      }

      await interaction.reply({
        content: '🔒 Closing ticket...',
        ephemeral: true
      });

      setTimeout(() => {
        interaction.channel.delete().catch(() => {});
      }, 3000);
    }
  }
};
