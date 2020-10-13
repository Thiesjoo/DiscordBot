const botCommands = require('../commands');




module.exports = function (bot) {
    let helpText = [{
        name: "help, h",
        value: "Display all commands"
    }]


    botCommands.functions.forEach(command => {
        helpText.push({ name: `${command.name} ${(command.alias !== undefined) ? `(${command.alias.join(",")})` : ""}`, value: command.description })
    })
}