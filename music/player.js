const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const play = require('play-dl');

const players = new Map();

module.exports = {
  async execute(message, args) {
    const query = args.join(' ');
    if (!query) return message.reply('❌ Provide a song name or link');

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply('❌ Join a voice channel first');

    let url;

    // 🔍 CHECK IF LINK OR SEARCH
    if (ytdl.validateURL(query)) {
      url = query;
    } else {
      const result = await play.search(query, { limit: 1 });
      if (!result.length) return message.reply('❌ No results found');

      url = result[0].url;
    }

    try {
      const stream = await play.stream(url);

      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator
      });

      const player = createAudioPlayer();
      const resource = createAudioResource(stream.stream, {
        inputType: stream.type
      });

      player.play(resource);
      connection.subscribe(player);

      players.set(message.guild.id, { connection, player });

      message.reply(`🎶 Now playing: ${url}`);

      player.on(AudioPlayerStatus.Idle, () => {
        connection.destroy();
      });

    } catch (err) {
      console.error(err);
      message.reply('❌ Error playing music');
    }
  },

  skip(message) {
    const data = players.get(message.guild.id);
    if (!data) return message.reply('❌ Nothing is playing');

    data.player.stop();
    message.reply('⏭ Skipped');
  },

  stop(message) {
    const data = players.get(message.guild.id);
    if (!data) return message.reply('❌ Nothing is playing');

    data.connection.destroy();
    players.delete(message.guild.id);

    message.reply('⏹ Stopped');
  }
};
