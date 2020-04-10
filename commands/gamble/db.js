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
        this.symbol = "Q"
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

async function updateUser(id, newUser) {
    return users.update({ _id: id }, newUser)
}

module.exports = {
    async initUser(id) {
        let user = await getUser(id)
        if (!user) user = await createUser(id)
        return user
    },


    async processResult(msg, user, result) {
        //result : {delta: 100, gameType: "Coinflip", bet: 1000}
        user.balance += result.delta
        await updateUser(msg.author.id, user)
        return msg.channel.send({
            embed: {
                color: result.delta > 0 ? [107, 235, 52] : [235, 52, 67],
                title: result.gameType,
                description: "You " + outcomeMap[result.delta > 0],
                fields: [
                    {
                        name: "You bet for",
                        value: "$" + (result.bet)
                    },
                    {
                        name: `You ${result.delta > 0 ? "gained" : "lost"}`,
                        value: "$" + Math.abs(result.delta)
                    },
                    {
                        name: "New balance",
                        value: "$" + user.balance
                    }
                ]
            }
        })
    },
    processInput(input, balance) {
        // console.log(input)
        if (typeof input == "string") {
            if (/^\d+$/.test(input)) {
                // console.log("It's a number")
                let amt = parseInt(input)
                console.log(amt)
                return amt
            } else {
                console.log("It's text")
                if (input.includes("%")) {
                    let percentage = "0."+input.slice(0,-1)
                    let float = parseFloat(percentage)
                    if (float < 0 || float > 100) return 0
                    console.log("Percentage: ", percentage, float, float*balance )
                    return float * balance
                } else if (input == "all") {
                    return balance
                }
            }
        } else {
            console.log("Not a string")
            return 0
        }
    },
    checkValid(amt, boundaries) {
        return !(amt < boundaries[0] || amt > boundaries[1])
    },
    updateUser
}