const player = require('../music/player');

module.exports = {
  name: 'play',
  async execute(message) {
    const args = message.content.split(' ').slice(1);
    player.execute(message, args);
  }
};
