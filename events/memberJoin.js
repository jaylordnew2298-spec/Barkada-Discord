const { EmbedBuilder } = require('discord.js');

// 🔧 CONFIG
const LOG_CHANNEL_ID = '1302058198660022324';

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const channel = member.guild.channels.cache.get(LOG_CHANNEL_ID);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor('#00ff88')
      .setTitle('🟢 Member Joined')
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '👤 User', value: `<@${member.id}>`, inline: true },
        { name: '🆔 ID', value: member.id, inline: true },
        { name: '📅 Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>` }
      )
      .setFooter({ text: `Total Members: ${member.guild.memberCount}` })
      .setTimestamp();

    channel.send({ embeds: [embed] });
  }
};
