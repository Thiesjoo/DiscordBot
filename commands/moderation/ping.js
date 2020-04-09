
module.exports = {
  name: 'ping',
  description: 'Test command. Returns "pong"',
  execute(msg, args) {
    msg.channel.send('pong');
  },
};