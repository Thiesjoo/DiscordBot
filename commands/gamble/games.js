const db = require("./db")

module.exports = [
    {
        name: "flip",
        description: "Do a coin flip for money.",
        async execute(msg, args) {
            if (msg.author.id in global.user_cache) {
                msg.reply("You are already participating in a game. Can't flip now")
                return
            }

            let balance = await db.getBalance(msg.author.id)
            const amount = db.processInput(args[0], balance)
            if (db.checkInvalid(amount, [0, balance])) {
                msg.reply("Please provide a valid amount. Usage: !flip <amount>")
                return
            }

            const result = Math.random()
            let final_result = { gameType: "Coinflip", bet: amount }
            final_result.delta = result > 0.5 ? -amount : amount
            db.processResult(msg.author.id, final_result, msg.channel)
        }
    },
    ...require("./roulette/game")
]