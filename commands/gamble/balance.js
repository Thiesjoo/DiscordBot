const db = require("./db")


module.exports = [{
    name: 'balance',
    alias: ["bal"],
    description: 'Balance check',
    async execute(msg, args) {
        console.log(db)
        let mention = msg.author.id
        if (args[0]) {
            mention = db.parseMention(args[0], msg)
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
}, {
    name: 'bailout',
    description: 'If you have no money left, you can get $2k ',
    async execute(msg, args) {
        let mention = msg.author.id
        if (args[0]) {
            mention = db.parseMention(args[0], msg)
            if (!mention) return
        }

        let user = await db.getBalance(mention)
        if (user !== 0) {
            msg.reply("You have money left")
            return
        }

        if (mention in global.user_cache) {
            msg.reply("You are currently betting, please finish the game first!")
        } else {
            let balance = await db.addBalance(mention, 2000)
            msg.channel.send(`<@${mention}>'s balance is: $${balance}`);
        }
    },
},
{
    name: 'leaderboard',
    alias: ["lb"],
    description: 'Show the leaderboard. Usage: !lb <win, balance(standard)>',
    async execute(msg, args) {
        let results = [] //{id, stat}
        let name = ""
        if (!args[0]) {
            args[0] = "balance"
        }
        if (args[0] == "balance") {
            name = "Balance"
            users = await db.getLeaderboard("balance")
            results = users.map(x => {
                return { id: msg.channel.members.get(x._id).nickname, stat: "$"+x.balance }
            }) 
        } else if (args[0] == "win") {
            name = "Win/loss ratio"
            users = await db.getLeaderboard("")
            results = users.map(x => {
                return { id: msg.channel.members.get(x._id).nickname, stat: (Math.round((x.wins/x.losses + Number.EPSILON) * 100) / 100)}
            })
            results.sort((a,b) => b.stat - a.stat)
        }else {
            msg.reply("Not a valid argument")
            return
        }
        let toSend = {	color: 0x0099ff,
            fields: [],
            title: `Leaderboard - ${name}`,}
            const indexes = ["1st","2nd", "3rd", "4th", "5th"]
        results.forEach((element,i) => {
            toSend.fields.push( {name:`${indexes[i]} place`,value:`${element.id} - ${element.stat}`})
        });
        msg.channel.send({embed: toSend})
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

        let mention = db.parseMention(args[0], msg)
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

        let mention_user_balance = await db.addBalance(mention, amount)
        if (mention_user_balance)  {
            
            user_balance = await db.addBalance(msg.author.id, -amount)

        msg.reply(`Successfully transfered $${amount}. Your balance is: $${user_balance} and <@${mention}> has $${mention_user_balance}`);

        } else {
            msg.reply(`<@${mention}> has not initialized his account yet. No money was transferd`)
        }
    },
}]