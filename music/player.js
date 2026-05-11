const { 
  joinVoiceChannel, 
  createAudioPlayer, 
  createAudioResource, 
  AudioPlayerStatus 
} = require('@discordjs/voice');

const play = require('play-dl');

const players = new Map();

module.exports = {

  async execute(message, args) {
    const query = args.join(' ');
    if (!query) return message.reply('❌ Provide a song name or URL');

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply('❌ Join a voice channel first');

    try {
      const search = await play.search(query, { limit: 1 });
      if (!search.length) return message.reply('❌ No results found');

      const url = search[0].url;

      const stream = await play.stream(url);

      const resource = createAudioResource(stream.stream, {
        inputType: stream.type
      });

      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator
      });

      const player = createAudioPlayer();
      players.set(message.guild.id, player);

      connection.subscribe(player);
      player.play(resource);

      message.channel.send(`🎶 Now Playing: **${search[0].title}**`);

      player.on(AudioPlayerStatus.Idle, () => {
        connection.destroy();
        players.delete(message.guild.id);
      });

    } catch (err) {
      console.error(err);
      message.reply('❌ Error playing music');
    }
  },

  skip(message) {
    const player = players.get(message.guild.id);
    if (!player) return message.reply('❌ Nothing playing');

    player.stop();
    message.channel.send('⏭ Skipped');
  },

  stop(message) {
    const player = players.get(message.guild.id);
    if (!player) return message.reply('❌ Nothing playing');

    player.stop();
    players.delete(message.guild.id);

    message.guild.members.me.voice.disconnect();

    message.channel.send('⏹ Stopped and left voice channel');
  }
};
