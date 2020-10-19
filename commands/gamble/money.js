const db = require("../../config/db")
const redis = require("../../config/redisPUB")
const { parseMsgMention, parseMention } = require("../../messages/helper")
const { inputToNumber, amountInBoundary } = require("./gambleHelper")

module.exports = [{
    name: 'balance',
    alias: ["bal"],
    description: 'Balance check',
    async execute(msg, args) {
        let mention = parseMsgMention(msg, args)
        let user = await db.getUser(mention)
        //Add ingame balance

        msg.channel.send(`<@${mention}>'s balance is: $${user.balance}`)
    },
}, {
    name: 'bailout',
    description: 'If you have no money left, you can get free dollars ($2k) ',
    async execute(msg, args) {
        let mention = parseMsgMention(msg, args)
        let user = await db.getUser(mention)

        if (user.balance > 0) {
            msg.reply("You still have money left.")
            return
        }

        if (user.cached && user.ingame) {
            msg.reply("You are ingame, can't get free money")
        } else {
            user = await db.addBalance(mention, 2000)
            msg.channel.send(`<@${mention}>'s balance is: $${user.balance}`);
        }
    },
},
{
    name: 'leaderboard',
    alias: ["lb"],
    description: 'Show the leaderboard. Usage: !lb <win, balance(standard)>',
    async execute(msg, args) {
        let results = [] //{name, stat}
        let name = ""
        if (!args[0]) args[0] = "balance" //Default to balance leaderboard


        if (args[0] == "balance") {
            name = "Balance"
            users = await db.getLeaderboard("balance")
            console.log(users)
            results = users.map(x => {
                return { name: x.name, stat: "$" + x.balance }
            })
        } else if (args[0] == "win") {
            name = "Win/loss ratio"
            users = await db.getLeaderboard("")
            results = users.map(x => {
                return { name: x.name, stat: (Math.round((x.wins / x.losses + Number.EPSILON) * 100) / 100) }
            })
            results.sort((a, b) => b.stat - a.stat)
        } else {
            msg.reply("Not a valid argument")
            return
        }

        let toSend = {
            color: 0x0099ff,
            fields: [],
            title: `Leaderboard - ${name}`,
        }
        const indexes = ["1st", "2nd", "3rd", "4th", "5th"]
        results.forEach((player, i) => {
            toSend.fields.push({ name: `${indexes[i]} place`, value: `${player.name} - ${player.stat}` })
        });
        msg.channel.send({ embed: toSend })
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

        let mention = parseMention(args[0], msg)
        if (!mention) return

        if (mention == msg.author.id) {
            msg.reply("You can't transfer money to yourself")
            return
        }

        let user1 = await db.getUser(msg.author.id);
        let user2 = await db.getUser(mention)

        if (user1.cached && user1.ingame) {
            msg.reply("You are currently participating in a game. You can't transfer money right now")
            return
        }
        if (user2.cached && user2.ingame) {
            msg.reply("The person you tried transferring money to is currently participating in a game. You can't transfer money right now")
            return
        }


        const amount = inputToNumber(args[1], user1.balance)
        if (!amountInBoundary(amount, [0, user1.balance])) {
            msg.reply("Please provide a valid amount. Usage: !transfer @Person <amount>")
            return
        }

        let newUser2 = await db.addBalance(mention, amount)
        if (newUser2) {
            let newUser1 = await db.addBalance(msg.author.id, -amount)
            msg.reply(`Successfully transfered $${amount}. Your balance is: $${newUser1.balance} and <@${mention}> has $${newUser2.balance}`);
        } else {
            msg.reply(`<@${mention}> has not initialized his account yet. No money was transferred`)
        }
    },
}]