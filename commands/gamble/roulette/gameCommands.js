const db = require("../../../config/db")
const conf = require("../../../config").roulette

const Game = require("./gameClass")

let games = {};

module.exports = [{
    name: "roulette",
    description: "Start a roulette game",
    async execute(msg, args) {
        if (!(msg.channel.id in games)) {
            games[msg.channel.id] = new Game(msg.channel, () => {
                delete games[msg.channel.id]
            });

        } else {
            msg.reply("A game is already running. You can bet with !bet")
        }
    }
},

{
    name: "bet",
    description: "Bet in an active roulette game game. Usage: !bet <amount to bet> <number, red, black, even, odd, 1st, 2nd, 3rd, 1-18,19-36>",
    async execute(msg, args) {
        if (!args[0] || !args[1]) {
            msg.reply("Invalid command. Usage: !bet <amount to bet> <number, red, black, even, odd, 1st, 2nd, 3rd, 1-18,19-36>")
            return
        }

        if (!(msg.channel.id in games)) {
            msg.reply("There is no game running in this channel currently")
        } else {

            let user = db.getUser(msg.author.id)
            if (user.cached && user.ingame == msg.channel.id) {
                msg.channel.send("You are already ingame")
            } else {
               
                let game = games[msg.channel.id]
                let result = await game.bet(msg.author.id, args[0], args[1] ,msg)
                if (result)  db.setStatus(msg.author.id, msg.channel.id)
            }
        }
    }
},

{
    name: 'set-symbol',
    alias: ["ss"],
    description: 'Set you symbol to be used in games. Usage: !symbol <your symbol>',
    async execute(msg, args) {
        if (!args[0]) {
            msg.reply("Please provide a symbol.")
            return
        }

        let symbol = args[0]
        if (symbol.length > 1) {
            msg.reply("Please provide a 1 character  symbol.")
            return
        }
        await db.updateSymbol(msg.author.id, symbol)
        msg.reply(`Updated your symbol to: ${symbol}!`)
    },
}, 

{
    name: 'finish-roulette',
    alias: ["finish"],
    description: 'Stop the roulette game that is currently running',
    async execute(msg, args) {
        if (!(msg.channel.id in games)) {
            msg.reply("There is no game running in this channel currently")
        } else {
            await games[msg.channel.id].rollNumber()
            msg.react("👍")
        }
    },
},
]