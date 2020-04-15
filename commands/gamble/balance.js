const db = require("./db")


module.exports = [{
    name: 'balance',
    alias: ["bal"],
    description: 'Balance check',
    async execute(msg, args) {
        let mention = msg.author.id
        if (args[0]) {
            let mention = db.parseMention(args[0], msg)
            if (!mention) return
        } 

        if (mention in global.user_cache) {
            let user = global.user_cache[mention]
            msg.channel.send(`<@${mention}>'s balance is: $${user.balance}. He is currently betting in: ${user.game}`)
        } else {
            let balance = await db.getBalance(mention)
            msg.channel.send(`<@${mention}>'s balance is: $${balance} (Doesn't include money from active games)`);
        }
    },
},
{
    name: 'transfer',
    description: 'Transfer money to another person. Usage: !transfer @Person <amount>',
    async execute(msg, args) {
        if (!args[0] || !args[1]) {
            msg.reply("Wrong usage! Usage: !transfer @Person <amount> ")
            return;
        }

        let mention =  db.parseMention(args[0], msg)
        if (!mention) return

        if (mention == msg.author.id) {
            msg.reply("You can't transfer money to yourself")
            return
        }


        if (msg.author.id in global.user_cache) {
            msg.reply("You are currently participating in a game. You can't transfer money right now")
            return
        }
        if (mention in global.user_cache) {
            msg.reply("The person you tried transfering money to is currently participating in a game. You can't transfer money right now")
            return
        }

        
        let user_balance = await db.getBalance(msg.author.id)

        const amount = db.processInput(args[1], user_balance)
        if (db.checkInvalid(amount, [0, user_balance])) {
            msg.reply("Please provide a valid amount. Usage: !transfer @Person <amount>")
            return
        }

        user_balance = db.addBalance(msg.author.id,-amount)
        let mention_user_balance  = db.addBalance(mention,amount)

        msg.reply(`Successfully transfered $${amount}. Your balance is: $${user_balance} and <@${mention}> has $${mention_user_balance}`);
    },
}]