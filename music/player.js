const { Player } = require('discord-player');
const { EmbedBuilder } = require('discord.js');

let player;

function init(client) {
  player = new Player(client);

  player.events.on('playerStart', (queue, track) => {
    const embed = new EmbedBuilder()
      .setColor('#00aaff')
      .setTitle('🎵 Now Playing')
      .setDescription(`**${track.title}**`)
      .addFields(
        { name: '⏱ Duration', value: track.duration, inline: true },
        { name: '👤 Requested by', value: `<@${track.requestedBy.id}>`, inline: true }
      );

    queue.metadata.channel.send({ embeds: [embed] });
  });

  // auto leave kapag walang laman
  player.events.on('emptyQueue', (queue) => {
    queue.metadata.channel.send('📭 Queue ended. Leaving voice channel.');
  });
}

async function play(message, query) {
  if (!message.member.voice.channel)
    return message.reply('❌ Join a voice channel first!');

  const result = await player.search(query.join(' '), {
    requestedBy: message.author
  });

  if (!result || !result.tracks.length)
    return message.reply('❌ No results found.');

  const queue = await player.nodes.create(message.guild, {
    metadata: {
      channel: message.channel
    }
  });

  try {
    if (!queue.connection)
      await queue.connect(message.member.voice.channel);
  } catch {
    player.nodes.delete(message.guild.id);
    return message.reply('❌ Cannot join voice channel.');
  }

  queue.addTrack(result.tracks[0]);

  if (!queue.isPlaying()) await queue.node.play();

  message.reply(`🎶 Added **${result.tracks[0].title}** to queue`);
}

function skip(message) {
  const queue = player.nodes.get(message.guild.id);
  if (!queue || !queue.isPlaying())
    return message.reply('❌ Nothing playing.');

  queue.node.skip();
  message.reply('⏭ Skipped!');
}

function stop(message) {
  const queue = player.nodes.get(message.guild.id);
  if (!queue)
    return message.reply('❌ Nothing playing.');

  queue.delete();
  message.reply('⏹ Stopped and left VC.');
}

module.exports = {
  init,
  play,
  skip,
  stop
};
