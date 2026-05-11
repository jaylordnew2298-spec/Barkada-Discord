const { EmbedBuilder } = require('discord.js');

// 🔧 CONFIG
const LOG_CHANNEL_ID = '1302058198660022324';

module.exports = {
  name: 'guildMemberRemove',
  async execute(member) {
    const channel = member.guild.channels.cache.get(LOG_CHANNEL_ID);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor('#ff4444')
      .setTitle('🔴 Member Left')
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '👤 User', value: `${member.user.tag}`, inline: true },
        { name: '🆔 ID', value: member.id, inline: true }
      )
      .setFooter({ text: `Total Members: ${member.guild.memberCount}` })
      .setTimestamp();

    channel.send({ embeds: [embed] });
  }
};
