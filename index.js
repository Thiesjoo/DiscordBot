require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = {}
const botCommands = require('./commands');

let helpText = [{
    name: "help, h",
    value: "Display all commands"
}]

botCommands.functions.forEach(command => {
    helpText.push({ name: `${command.name} ${(command.alias !== undefined) ? `(${command.alias.join(",")})` : ""}`, value: command.description })
    bot.commands[command.name] = command
})

botCommands.events.forEach(event => {
    bot.on(event.name, msg => {
        if (msg.author.bot) return;
        event.execute(msg)
    })
})

const TOKEN = process.env.TOKEN;
bot.login(TOKEN);

bot.on('ready', () => {
    console.info(`Logged in as ${bot.user.tag}!`);
    bot.user.setPresence({
        activity: { name: 'Rickle Pick', type: "WATCHING" }, status: 'online'
    })
});

bot.on('message', msg => {
    if (msg.author.bot) return;
    if (msg.channel.name !== "gambling" && msg.channel.name !== "auswitz") return

    if (msg.content[0] == "!") {
        const temp = msg.content.substr(1)
        const args = temp.split(/ +/);
        const command = args.shift().toLowerCase();
        // console.info(`Called command: ${command}`);

        if (command == "help" || command == "h") {
            msg.channel.send({
                embed: {
                    color: 3447003,
                    title: "Commands",
                    fields: helpText
                }
            })
            return
        }


        try {
            if (!(command in bot.commands)) {
                let alias = Object.values(bot.commands).find(x => {
                    return x.alias &&  x.alias.includes(command)
                })

                if (alias) {
                    alias.execute(msg,args)
                } else {
                    msg.reply("That command does not exist. Type !help for help")
                }
            } else {
                bot.commands[command].execute(msg, args);
            }



        } catch (error) {
            console.error(error);
            msg.reply('there was an error trying to execute that command!');
        }
    }
});


process.stdin.resume();//so the program will not close instantly

function exitHandler(options, exitCode) {
    if (options.cleanup) bot.destroy()
    if (options.exit) process.exit();
    console.log("Terminated")
}

//do something when app is closing
process.on('exit', exitHandler.bind(null, { cleanup: true }));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));

//catches uncaught exceptions
// process.on('uncaughtException', exitHandler.bind(null, { exit: true }));