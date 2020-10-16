const botCommands = require('../commands');

module.exports = function (bot) {
    let helpText = [{
        name: "help, h",
        value: "Display all commands"
    }]

    botCommands.functions.forEach(command => {
        if (command.admin) return
        helpText.push({ name: `${command.name} ${(command.alias !== undefined) ? `(${command.alias.join(",")})` : ""}`, value: command.description })
    })
    
    helpText.sort((a,b) => {return a.name.localeCompare(b.name)})
    bot.helpText = helpText
}