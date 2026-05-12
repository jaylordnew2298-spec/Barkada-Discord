const { setData, getData } = require('../database.js');
const { EmbedBuilder } = require('discord.js');

// ── BAD WORDS ──
const badwords = [
  "fuck","shit","bitch","asshole","bastard","dick","pussy","cunt",
  "slut","whore","retard","idiot","moron",
  "motherfucker","fucker","bullshit","fuckface",
  "kys","kill yourself",
  "tanga","bobo","gago","puta","pakyu","ulol",
  "tangina","pota","kantot","jakol","puke",
  "fvck","fck","fuk","sh1t","b1tch"
];

// ── RACIST ──
const racistWords = ["nigger","nigga","chimp","chink","indio"];

// ⏱ MUTE DURATIONS
const punishments = [
  5 * 60 * 1000,
  20 * 60 * 1000,
  60 * 60 * 1000
];

// ── SPAM TRACKER
const spamMap = new Map();

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const messages = {
  bad: ["Watch your language.", "Respect others."],
  racist: ["Racist language is not allowed."],
  spam: ["Stop spamming.", "Too many messages detected."]
};

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot) return;
    if (!message.guild) return;

    const userId = message.author.id;
    const guildId = message.guild.id;
    const text = message.content.toLowerCase();

    // ── ANTI BYPASS
    const clean = text
      .replace(/[@4]/g, "a")
      .replace(/[!1]/g, "i")
      .replace(/3/g, "e")
      .replace(/0/g, "o")
      .replace(/5/g, "s")
      .replace(/7/g, "t")
      .replace(/[^a-z0-9]/g, "");

    let type = null;
    let note = "";

    // ── BAD WORD
    if (badwords.some(w => clean.includes(w))) {
      type = "Bad Language";
      note = pick(messages.bad);
    }

    // ── RACIST
    if (racistWords.some(w => clean.includes(w))) {
      type = "Racist Language";
      note = pick(messages.racist);
    }

    // ── SPAM DETECTION
    const now = Date.now();
    if (!spamMap.has(userId)) spamMap.set(userId, []);

    const userMessages = spamMap.get(userId);

    const filtered = userMessages.filter(msg => now - msg.time < 5000);
    filtered.push({ content: text, time: now });
    spamMap.set(userId, filtered);

    const sameMsgCount = filtered.filter(m => m.content === text).length;

    if (filtered.length >= 5 || sameMsgCount >= 3) {
      type = "Spam";
      note = pick(messages.spam);
    }

    if (!type) return;

    // ── WARNING SYSTEM
    let data = await getData(`warnings/${guildId}/${userId}`);
    if (!data) data = { count: 0 };

    if (data.count >= 3) data.count = 0;

    data.count++;

    await setData(`warnings/${guildId}/${userId}`, data);

    const duration = punishments[data.count - 1];
    const minutes = Math.floor(duration / 60000);

    // ── EMBED
    const embed = new EmbedBuilder()
      .setColor('#ffaa00')
      .setTitle('⚠️ WARNING')
      .addFields(
        { name: '👤 User', value: `<@${userId}>`, inline: true },
        { name: '🚫 Violation', value: type, inline: true },
        { name: '🔇 Action', value: `Muted for ${minutes} minute${minutes > 1 ? 's' : ''}` },
        { name: '📝 Note', value: note },
        { name: '⚠️ Strike', value: `${data.count}/3` }
      );

    await message.reply({ embeds: [embed] });

    // 🔇 MUTE
    try {
      if (!message.member.moderatable) return;

      await message.member.timeout(duration, "Auto moderation");

      await message.channel.send(
        `🔇 <@${userId}> has been muted for **${minutes} minute${minutes > 1 ? 's' : ''}** due to **${type}**.`
      );

    } catch (err) {
      console.error("Mute failed:", err);
    }
  }
};
