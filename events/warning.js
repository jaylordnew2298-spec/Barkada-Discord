const { setData, getData } = require('../database.js');
const { EmbedBuilder } = require('discord.js');

// ── BAD WORDS (EXPANDED) ──
const badwords = [
  // 🔥 ENGLISH
  "fuck","fucker","fucking","fuckface","motherfucker",
  "shit","bullshit","shithead","dipshit",
  "bitch","bastard","ass","asshole","asshat","dumbass",
  "douche","douchebag","jackass","retard","idiot","moron",
  "stupid","dumb","loser",

  // 🔞 SEXUAL
  "porn","sex","sexy","nude","nudes","boobs","tits",
  "penis","vagina","cum","orgasm","rape","rapist",
  "blowjob","handjob","anal",

  // ☠️ TOXIC
  "kys","kill yourself","go die","die","kill urself","suicide",

  // 🏳️‍🌈 SLURS
  "faggot","gayass","lesbo","tranny",

  // 🇵🇭 FILIPINO
  "tanga","bobo","gago","puta","putangina","pakyu",
  "ulol","inutil","tangina","tang ina","pota",
  "inamo","kantot","kantutan","jakol","jakolero",
  "puke","puki","supot","bayag","tarantado",
  "bwisit","leche","gunggong","engot","baliw",

  // 🧠 BYPASS VARIANTS
  "fvck","fck","fuk","fuxk",
  "sh1t","sht","shyt",
  "b1tch","btch",
  "d1ck","dck",
  "p0rn","prn"
];

// ── RACIST ──
const racistWords = [
  "nigger","nigga","chimp","chink","indio"
];

// ── ALLOWED LINKS ──
const allowedLinks = [
  "facebook.com","fb.com","tiktok.com","youtube.com","youtu.be","roblox.com"
];

// ── RANDOM PICK ──
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── MESSAGES ──
const messages = {
  bad: ["Watch your language.", "Respect others."],
  racist: ["Racist language is not allowed."],
  link: ["Unauthorized link detected."]
};

// ⏱ MUTE DURATIONS
const punishments = [
  5 * 60 * 1000,    // 5 mins
  20 * 60 * 1000,   // 20 mins
  60 * 60 * 1000    // 1 hour
];

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot) return;
    if (!message.guild) return;

    const text = message.content.toLowerCase();

    // 🔥 ANTI BYPASS (leet + symbols)
    const clean = text
      .replace(/[@4]/g, "a")
      .replace(/[!1]/g, "i")
      .replace(/3/g, "e")
      .replace(/0/g, "o")
      .replace(/5/g, "s")
      .replace(/7/g, "t")
      .replace(/[^a-z0-9]/g, "")
      .replace(/\s+/g, "");

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

    // ── LINK
    if (/https?:\/\/|www\./.test(text)) {
      const allowed = allowedLinks.some(link => text.includes(link));
      if (!allowed) {
        type = "Unauthorized Link";
        note = pick(messages.link);
      }
    }

    if (!type) return;

    const userId = message.author.id;
    const guildId = message.guild.id;

    let data = await getData(`warnings/${guildId}/${userId}`);
    if (!data) data = { count: 0 };

    // 🔁 RESET AFTER 3
    if (data.count >= 3) data.count = 0;

    data.count++;

    await setData(`warnings/${guildId}/${userId}`, data);

    const duration = punishments[data.count - 1];
    const minutes = Math.floor(duration / 60000);

    // 🎨 EMBED
    const embed = new EmbedBuilder()
      .setColor('#ffaa00')
      .setTitle('⚠️ WARNING')
      .addFields(
        { name: '👤 User', value: `<@${userId}>`, inline: true },
        { name: '🚫 Violation', value: type, inline: true },
        { name: '🔇 Action', value: `Muted for ${minutes} minute${minutes > 1 ? 's' : ''}` },
        { name: '📝 Note', value: note },
        { name: '⚠️ Strike', value: `${data.count}/3` }
      )
      .setFooter({ text: 'Barkada Protection System' });

    await message.reply({ embeds: [embed] });

    // 🔇 APPLY MUTE
    try {
      await message.member.timeout(duration, "Auto moderation");

      await message.channel.send(
        `🔇 <@${userId}> has been muted for **${minutes} minute${minutes > 1 ? 's' : ''}** due to **${type}**.`
      );

    } catch (err) {
      console.error("Mute failed:", err);
    }
  }
};
