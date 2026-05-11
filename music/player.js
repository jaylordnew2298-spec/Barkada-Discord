const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const play = require('play-dl');

const queue = new Map();

module.exports = {
  async execute(message, args) {
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel) {
      return message.reply('❌ Join a voice channel first');
    }

    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has('Connect') || !permissions.has('Speak')) {
      return message.reply('❌ I need permissions to join & speak');
    }

    const query = args.join(' ');
    if (!query) return message.reply('❌ Enter a song name');

    const serverQueue = queue.get(message.guild.id);

    const song = {
      title: query,
      url: query
    };

    if (!serverQueue) {
      const queueContruct = {
        textChannel: message.channel,
        voiceChannel,
        connection: null,
        player: createAudioPlayer(),
        songs: []
      };

      queue.set(message.guild.id, queueContruct);
      queueContruct.songs.push(song);

      try {
        const connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: message.guild.id,
          adapterCreator: message.guild.voiceAdapterCreator
        });

        queueContruct.connection = connection;
        connection.subscribe(queueContruct.player);

        this.playSong(message.guild, queueContruct.songs[0]);

      } catch (err) {
        console.error(err);
        queue.delete(message.guild.id);
        return message.reply('❌ Error joining voice');
      }

    } else {
      serverQueue.songs.push(song);
      return message.reply(`✅ Added to queue: **${query}**`);
    }
  },

  async playSong(guild, song) {
    const serverQueue = queue.get(guild.id);

    if (!song) {
      serverQueue.connection.destroy();
      queue.delete(guild.id);
      return;
    }

    try {
      const stream = await play.stream(song.url);

      const resource = createAudioResource(stream.stream, {
        inputType: stream.type
      });

      serverQueue.player.play(resource);

      serverQueue.player.once(AudioPlayerStatus.Idle, () => {
        serverQueue.songs.shift();
        this.playSong(guild, serverQueue.songs[0]);
      });

      serverQueue.textChannel.send(`🎶 Now Playing: **${song.title}**`);

    } catch (err) {
      console.error(err);
      serverQueue.songs.shift();
      this.playSong(guild, serverQueue.songs[0]);
    }
  },

  skip(message) {
    const serverQueue = queue.get(message.guild.id);
    if (!serverQueue) return message.reply('❌ Nothing playing');
    serverQueue.player.stop();
  },

  stop(message) {
    const serverQueue = queue.get(message.guild.id);
    if (!serverQueue) return message.reply('❌ Nothing playing');

    serverQueue.songs = [];
    serverQueue.player.stop();
    serverQueue.connection.destroy();
    queue.delete(message.guild.id);
  }
};
