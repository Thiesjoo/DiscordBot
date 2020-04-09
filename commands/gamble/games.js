const db = require("./db")

module.exports = [
    {
        name: "flip",
        description: "Do a coin flip for money.",
        async execute(msg, args) {
            let user = await db.initUser(msg.author.id)
            const amount = parseInt(args[0])
            if (!amount || amount < 0 || amount > user.balance) {
                msg.reply("Please provide a valid amount. Usage: !flip <amount>")
                return
            }
            const result = Math.random()
            if (result > 0.5) {
                user.balance -= amount
                msg.channel.send("It was tails! You lost")
            } else {
                user.balance += amount
                msg.channel.send("It was heads! YOU WON! ")
            }
            await db.updateUser(msg.author.id, user)
            msg.reply(`New balance $${user.balance}`)
        }
    },
    {name: "add-money",
    alias: ["test123"],
    description: "Add 1000 bucks",
    async execute(msg, args) {
        let user = await db.initUser(msg.author.id)
        user.balance += 1000
        await db.updateUser(msg.author.id, user)
        msg.reply(`Here ya got. New balance $${user.balance}`)
    }}
]