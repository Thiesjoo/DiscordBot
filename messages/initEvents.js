const botCommands = require('../commands');

module.exports = function (bot) {
    botCommands.events.forEach(event => {
        bot.on(event.name, (data1, data2) => {
            event.execute(data1, data2, bot)
        })
    })
}