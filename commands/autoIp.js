module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot) return;

    const msg = message.content.toLowerCase();

    // ✅ mas precise detection
    const ipPattern = /\b(ip|server ip|ano ip|ip ng server|minecraft ip|mc ip)\b/;

    if (!ipPattern.test(msg)) return;

    message.reply(`
Choose the server that gives you the best ping: 🇵🇭 PH 🇸🇬 SG 🇭🇰 HK

━━━━━━━━━━━━━━━
🎮 BARKADA CRAFT SMP
━━━━━━━━━━━━━━━

📡 SERVER IPs

🇵🇭 PH SERVER
┃ JAVA IP: barkadacraftsmp.ph1-mczie.fun:4090
┃ BEDROCK IP: barkadacraftsmp.ph1-mczie.fun
┃ PORT: 4090

🇸🇬 SG SERVER
┃ JAVA IP: barkadacraftsmp.sg1-mczie.fun:4090
┃ BEDROCK IP: barkadacraftsmp.sg1-mczie.fun
┃ PORT: 4090

🇭🇰 HK SERVER
┃ JAVA IP: barkadacraftsmp.hk-mczie.fun:4090
┃ BEDROCK IP: barkadacraftsmp.hk-mczie.fun
┃ PORT: 4090

━━━━━━━━━━━━━━━
✅ Piliin ang pinaka smooth at hindi lag para sayo!
⚔️ See you in-game!
    `);
  }
};
