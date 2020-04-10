const db = require("./db")

module.exports = [
    {
        name: "flip",
        description: "Do a coin flip for money.",
        async execute(msg, args) {
            let user = await db.initUser(msg.author.id)
            const amount = db.processInput(args[0], user.balance)
            if (!db.checkValid(amount, [0, user.balance])) {
                msg.reply("Please provide a valid amount. Usage: !flip <amount>")
                return
            }


            const result = Math.random()
            let final_result = { gameType: "Coinflip", bet: amount }
            final_result.delta = result > 0.5 ? -amount : amount
            db.processResult(msg, user, final_result)
        }
    },
    {
        name: "add-money",
        alias: ["test123"],
        description: "Add 1000 bucks",
        async execute(msg, args) {
            let user = await db.initUser(msg.author.id)
            user.balance += 1000
            await db.updateUser(msg.author.id, user)
            msg.reply(`Here ya got. New balance $${user.balance}`)
        }
    },
    ...require("./roulette/game")
]