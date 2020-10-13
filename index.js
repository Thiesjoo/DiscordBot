require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = {}


require("./messages/generateHelp")(bot)
require("./messages/initCommands")(bot)
require("./messages/initEvents")(bot)
const processMessage = require('./messages/processMessage')(bot);


const TOKEN = process.env.TOKEN;
if (!TOKEN) {
    console.error("I need a token to function. Please provide token in the .env file, or passing it as a env variable. :)")
    process.exit()
}
bot.login(TOKEN);

bot.on('ready', () => {
    console.info(`Logged in as ${bot.user.tag}!`);
    bot.user.setPresence({
        activity: { name: 'My developer coding me', type: "WATCHING" }, status: 'idle'
    })
});



bot.on('message', msg => {
     processMessage(msg)
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