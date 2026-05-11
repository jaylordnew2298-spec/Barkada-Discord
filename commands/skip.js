const player = require('../music/player');

module.exports = {
  name: 'skip',
  execute(message) {
    player.skip(message);
  }
};
