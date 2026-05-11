const {
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

const CATEGORY_ID = '1320198142012162110';
const LOG_CHANNEL = '1311656159123603457';
const STAFF_ROLE_ID = '1502803853475709108';

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {

    if (!interaction.isButton()) return;

    // 🎫 CREATE TICKET
    if (interaction.customId === 'create_ticket') {

      // 🚫 PREVENT MULTIPLE TICKETS
      const existing = interaction.guild.channels.cache.find(
        c => c.name === `ticket-${interaction.user.id}`
      );

      if (existing) {
        return interaction.reply({
          content: `❌ You already have a ticket: ${existing}`,
          ephemeral: true
        });
      }

      // 📂 CREATE CHANNEL
      const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.id}`,
        type: ChannelType.GuildText,
        parent: CATEGORY_ID,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionFlagsBits.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory
            ]
          },
          {
            id: STAFF_ROLE_ID,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory
            ]
          }
        ]
      });

      // 🎨 EMBED
      const embed = new EmbedBuilder()
        .setColor('#00ffcc')
        .setTitle('🎫 Ticket Opened')
        .setDescription('Support will assist you shortly.');

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('close_ticket')
          .setLabel('🔒 Close Ticket')
          .setStyle(ButtonStyle.Danger)
      );

      await channel.send({
        content: `<@${interaction.user.id}> <@&${STAFF_ROLE_ID}>`,
        embeds: [embed],
        components: [row]
      });

      await interaction.reply({
        content: `✅ Ticket created: ${channel}`,
        ephemeral: true
      });
    }

    // 🔒 CLOSE TICKET
    if (interaction.customId === 'close_ticket') {

      if (!interaction.channel.name.startsWith('ticket-')) return;

      const messages = await interaction.channel.messages.fetch({ limit: 100 });

      // 📝 CREATE TRANSCRIPT
      let transcript = `TICKET TRANSCRIPT\n\n`;

      messages.reverse().forEach(msg => {
        transcript += `[${msg.author.tag}] ${msg.content}\n`;
      });

      const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL);

      if (logChannel) {
        await logChannel.send({
          content: `📁 Ticket closed: ${interaction.channel.name} by <@${interaction.user.id}>`,
          files: [
            {
              attachment: Buffer.from(transcript, 'utf-8'),
              name: `transcript-${interaction.channel.name}.txt`
            }
          ]
        });
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
