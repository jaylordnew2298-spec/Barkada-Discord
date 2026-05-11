const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const playdl = require('play-dl');
const { EmbedBuilder } = require('discord.js');

const TEMP_DIR = path.join(process.cwd(), 'temp');
fs.ensureDirSync(TEMP_DIR);

let scReady = false;

async function ensureSC() {
  if (scReady) return;
  const id = await playdl.getFreeClientID();
  await playdl.setToken({ soundcloud: { client_id: id } });
  scReady = true;
}

function run(cmd) {
  return new Promise((res, rej) => {
    exec(cmd, (err) => {
      if (err) return rej(err);
      res();
    });
  });
}

async function searchAndDownload(query, rawPath) {
  await ensureSC();

  const results = await playdl.search(query, {
    source: { soundcloud: 'tracks' },
    limit: 5
  });

  if (!results.length) throw new Error('No results');

  for (const track of results) {
    try {
      const stream = await playdl.stream(track.url);

      await new Promise((res, rej) => {
        const writer = fs.createWriteStream(rawPath);
        stream.stream.pipe(writer);
        writer.on('finish', res);
        writer.on('error', rej);
      });

      return {
        title: track.name,
        artist: track.user?.name || 'Unknown'
      };

    } catch {
      continue;
    }
  }

  throw new Error('Failed to stream');
}

module.exports = {
  name: 'play',

  async execute(message, args) {
    if (!args.length) {
      return message.reply('❌ Usage: .play <song name>');
    }

    const query = args.join(' ');

    // 🟡 SEARCH EMBED
    const searchEmbed = new EmbedBuilder()
      .setColor('#FEE75C')
      .setDescription(`🔍 Searching: **${query}**...`);

    await message.channel.send({ embeds: [searchEmbed] });

    const ts = Date.now();
    const rawPath = path.join(TEMP_DIR, `raw_${ts}`);
    const outPath = path.join(TEMP_DIR, `out_${ts}.mp3`);

    try {
      const { title, artist } = await searchAndDownload(query, rawPath);

      await run(`ffmpeg -y -i "${rawPath}" -vn -ar 44100 -ac 2 -b:a 128k "${outPath}"`);

      // 🟡 RESULT EMBED
      const musicEmbed = new EmbedBuilder()
        .setColor('#FEE75C')
        .setTitle('🎧 Now Playing')
        .addFields(
          { name: '🎵 Title', value: title, inline: false },
          { name: '👤 Artist', value: artist, inline: false },
          { name: '📥 Info', value: 'Download below 👇', inline: false }
        )
        .setFooter({ text: 'Barkada Music System' })
        .setTimestamp();

      await message.channel.send({
        embeds: [musicEmbed],
        files: [outPath]
      });

      fs.remove(rawPath);
      setTimeout(() => fs.remove(outPath), 60000);

    } catch (err) {
      console.error(err);

      const errorEmbed = new EmbedBuilder()
        .setColor('Red')
        .setDescription('❌ Failed to fetch song');

      message.channel.send({ embeds: [errorEmbed] });
    }
  }
};
