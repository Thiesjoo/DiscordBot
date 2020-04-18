const Datastore = require('nedb-promises')

const users = new Datastore({ filename: 'db/users.db', autoload: true });
const startingBalance = 20000
const outcomeMap = { true: "win! :smiley:", false: "lose! :sob:" }


class User {
    constructor(id, balance) {
        this._id = id
        this.balance = balance
        this.wins = 0
        this.losses = 0
        const currentUser = global.bot.users.cache.get(id)
        if (currentUser) {
            this.symbol = currentUser.username[0]
        } else {
            this.symbol = "Q"

        }
    }
}

async function createUser(id) {
    let newUser = new User(id, startingBalance)
    try {
        await users.insert(newUser)
        return newUser
    } catch (error) {
        console.error("Creating failed: ", error)
    }
}

async function getUser(id) {
    try {
        return users.findOne({ _id: id })
    } catch {
        console.error("Couldn't get user")
    }
}

async function getBalance(id) {
    let user = await initUser(id)
    return user.balance
}

async function getSymbol(id) {
    let user = await initUser(id)
    return user.symbol
}

async function updateSymbol(id, symbol) {
    return users.update({ _id: id }, { $set: { symbol } })
}

async function addBalance(id, delta) {
    let user = await users.update({ _id: id }, { $inc: { balance: delta } }, { returnUpdatedDocs: true, upsert: false })
    if (user) return user.balance
    return 0
}

async function addWin(id) {
    return users.update({ _id: id }, { $inc: { wins: 1 } })
}

async function addLoss(id) {
    return users.update({ _id: id }, { $inc: { losses: 1 } })
}

function parseMention(mention, msg) {
    if (!mention) {
        msg.reply("You have to mention someone in the first argument")
        return false
    }
    if (mention.startsWith('<@') && mention.endsWith('>')) {
        mention = mention.slice(2, -1);
        if (mention.startsWith('!')) {
            mention = mention.slice(1);
        } else if (mention.startsWith("&")) {
            msg.reply("You can't mention roles")
            return false
        }
    } else {
        msg.reply("Invalid mention")
        return false
    }
    return mention
}

async function processResult(id, result, channel) {
    //result : {delta: 100, gameType: "Coinflip", bet: 1000}
    let balance = await addBalance(id, result.delta)
    if (result.delta > 0) {
        await addWin(id)
    } else {
        await addLoss(id)
    }
    return channel.send({
        embed: {
            color: result.delta > 0 ? [107, 235, 52] : [235, 52, 67],
            title: result.gameType,
            description: "You " + outcomeMap[result.delta > 0],
            fields: [
                {
                    name: `You ${result.delta > 0 ? "gained" : "lost"}`,
                    value: "$" + Math.abs(result.delta)
                },
                {
                    name: "New balance",
                    value: "$" + balance
                }
            ]
        }
    })
}

async function initUser(id) {
    let user = await getUser(id)
    if (!user) user = await createUser(id)
    return user
}

async function getLeaderboard(type,query=-1) {
    return users.find({}).sort({[type]:query}).limit(5)
}

module.exports = {
    initUser, parseMention, getSymbol,getLeaderboard,

    processInput(input, balance) {
        if (isNum(input)) {
            let amt = parseInt(input)
            return amt
        } else {
            if (input.includes("%")) {
                let float = parseFloat(input.slice(0, -1)/100)
                if (float < 0 || float > 100) return 0
                return Math.round(float * balance)
            } else if (input == "all") {
                return balance
            }
        }
    },
    checkInvalid(amt, boundaries) {
        if (!amt) return true
        if (amt < boundaries[0]) return true
        if (amt > boundaries[1]) return true
        return false
    },
    addLoss, addBalance, addWin, processResult, updateSymbol, getBalance
}

function isNum(num) {
    return !isNaN(num)
}