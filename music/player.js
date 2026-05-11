const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const play = require('play-dl');

const queues = new Map();

async function playSong(guild, song) {
  const queue = queues.get(guild.id);
  if (!song) {
    queue.connection.destroy();
    queues.delete(guild.id);
    return;
  }

  const stream = await play.stream(song.url);

  const resource = createAudioResource(stream.stream, {
    inputType: stream.type
  });

  queue.player.play(resource);

  queue.player.once(AudioPlayerStatus.Idle, () => {
    queue.songs.shift();
    playSong(guild, queue.songs[0]);
  });
}

module.exports = {
  async execute(message, args) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply('❌ Join a voice channel first!');

    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has('Connect') || !permissions.has('Speak')) {
      return message.reply('❌ I need permission to join and speak!');
    }

    const query = args.join(' ');
    if (!query) return message.reply('❌ Provide a song name or URL');

    const result = await play.search(query, { limit: 1 });
    const song = {
      title: result[0].title,
      url: result[0].url
    };

    let queue = queues.get(message.guild.id);

    if (!queue) {
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator
      });

      const player = createAudioPlayer();

      connection.subscribe(player);

      queue = {
        connection,
        player,
        songs: []
      };

      queues.set(message.guild.id, queue);
    }

    queue.songs.push(song);

    if (queue.songs.length === 1) {
      playSong(message.guild, queue.songs[0]);
    }

    message.reply(`🎵 Playing: **${song.title}**`);
  },

  skip(message) {
    const queue = queues.get(message.guild.id);
    if (!queue) return message.reply('❌ Nothing playing');

    queue.player.stop();
    message.reply('⏭ Skipped!');
  },

  stop(message) {
    const queue = queues.get(message.guild.id);
    if (!queue) return message.reply('❌ Nothing playing');

    queue.connection.destroy();
    queues.delete(message.guild.id);

    message.reply('⏹ Stopped!');
  }
};
