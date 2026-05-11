const player = require('../music/player');

module.exports = {
  name: 'stop',
  execute(message) {
    player.stop(message);
  }
};
