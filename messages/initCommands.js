const botCommands = require('../commands');

module.exports = function (bot) {
    botCommands.functions.forEach(command => {
        bot.commands[command.name] = command
    })
}