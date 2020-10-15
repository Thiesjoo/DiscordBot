require('dotenv').config();
const TOKEN = process.env.TOKEN;
if (!TOKEN) {
    console.error("I need a token to function. Please provide token in the .env file, or passing it as a env variable. :)")
    process.exit()
}

//Discord
const Discord = require('discord.js');
const config = require('./config');
const bot = new Discord.Client();
bot.commands = {}

bot.login(TOKEN);


global.bot = bot //Only for gamble commands
//FIXME: Remove this



// Discord Commands
require("./messages/generateHelp")(bot)
require("./messages/initCommands")(bot)
require("./messages/initEvents")(bot)
const processMessage = require('./messages/processMessage')(bot);


// Redis:

const redis = require("./config/redisSUB")

redis.on("ready", async () => {
    redis.on("message", (channel,message) => {
        switch (channel) {
            case "status:update":
                console.log(`[MAIN] ${message} is updating`)
                updatePresence()
        }
    })
    redis.subscribe("status:update")
})



bot.on('ready', () => {
    config.ready.discord = 1;
    updatePresence()
    console.log(`[BOT] Logged in as ${bot.user.tag}!`);
});

bot.on('message', msg => {
    const rd = config.ready

    if (rd.discord && rd.redis && rd.database)processMessage(msg)
});


function updatePresence() {

    const rd = config.ready
    const st = config.statusIcons;
    const presence =  `Messages, Bot: ${st[rd.discord]}, Redis: ${st[rd.redis]}, Database: ${st[rd.database]}`

    console.log("[MAIN] Status:", presence)

    bot.user.setPresence({
        activity: { name: presence, type: "LISTENING" }, status: rd.discord && rd.redis && rd.database ? "" : "idle"
    })
}


//Exit handling
process.stdin.resume();//so the program will not close instantly

function exitHandler(options, exitCode) {
    if (options.cleanup) bot.destroy()
    if (options.exit) process.exit();
    console.log("Terminated")
    console.log("Can we wait?")

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