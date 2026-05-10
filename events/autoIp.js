const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot) return;

    const msg = message.content.toLowerCase();

    const ipPattern = /\b(ip|server ip|ano ip|ip ng server|mc ip)\b/;
    if (!ipPattern.test(msg)) return;

    const embed = new EmbedBuilder()
      .setColor('#00ff99') // 🟢 kulay ng gilid
      .setTitle('🎮 BARKADA CRAFT SMP')
      .setDescription(`
Choose the server that gives you the best ping:

🇵🇭 **PH SERVER**
┃ JAVA IP: barkadacraftsmp.ph1-mczie.fun:4090  
┃ BEDROCK IP: barkadacraftsmp.ph1-mczie.fun  
┃ PORT: 4090  

🇸🇬 **SG SERVER**
┃ JAVA IP: barkadacraftsmp.sg1-mczie.fun:4090  
┃ BEDROCK IP: barkadacraftsmp.sg1-mczie.fun  
┃ PORT: 4090  

🇭🇰 **HK SERVER**
┃ JAVA IP: barkadacraftsmp.hk-mczie.fun:4090  
┃ BEDROCK IP: barkadacraftsmp.hk-mczie.fun  
┃ PORT: 4090  

━━━━━━━━━━━━━━━
✅ Piliin ang pinaka smooth at hindi lag!
⚔️ See you in-game!
      `)
      .setFooter({ text: 'Barkada Craft SMP' });

    message.reply({ embeds: [embed] });
  }
};
