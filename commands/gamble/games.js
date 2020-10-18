const { inputToNumber, amountInBoundary, processResult  } = require("./gambleHelper")
const db = require("../../config/db")

module.exports = [
    {
        name: "flip",
        description: "Do a coin flip for money.",
        async execute(msg, args) {

            // let mention = parseMsgMention(msg, args)
            let user = await db.getUser(msg.author.id)
    
            if (user.cached && user.ingame) {
                msg.reply("You are already participating in a game. Can't flip now")
                return
            }

            const amount = inputToNumber(args[0], user.balance)
            if (amountInBoundary(amount, [0, user.balance])) {
                msg.reply("Please provide a valid amount. Usage: !flip <amount>")
                return
            }

            const result = Math.random()
            let final_result = { gameType: "Coinflip", bet: amount }
            final_result.delta = result > 0.5 ? -amount : amount
            await processResult(msg.author.id, final_result, msg.channel, db)
        }
    },
    ...require("./roulette/gameCommands")
]