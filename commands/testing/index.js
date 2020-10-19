const database = require('../../config/db')
const redis = require('../../config/redisPUB')
const { parseMsgMention, getName } = require('../../messages/helper')


let functions = [
    {
        name: "discard",
        description: "This command will wipe all user data that is in cache. This will stop any active games",
        execute: async function (msg, args) {
            console.log("Discarding all redis cached data. Discarding the entire database")
            if (args[0]) {
                switch (args[0]) {
                    case "redis":
                        await redis.flushall()
                        console.log("Redis gone")
                    case "mongo":
                        await database.wipeDatabase()
                        console.log("Mongo gone")
                }
            } else {
                await redis.flushall()
                await database.wipeDatabase()
                console.log("Mongo and redis gone")
            }
        }
    },
    {
        name: "getuser",
        description: "Get user",
        execute: async function (msg, args) {
            let result = await database.getUser(parseMsgMention(msg, args))
            console.log(result)
            msg.channel.send(`The result was ${result.cached ? "" : "not "}cached` )
        }
    },
    {
        name: "createuser",
        description: "yes",
        execute: async function (msg, args) {
            let mention = parseMsgMention(msg, args)
            if (!mention) return
            //Create account for current user
            let result = await database.createUser(mention, await getName(mention, msg))
            console.log(result)
            msg.channel.send("New user created")
        }
    },
    {
        name: "win",
        description: "yes",
        execute: async function (msg, args) {
            //Create account for current user
            let result = await database.addWin(msg.author.id)
            console.log("Win result:", result)
            msg.channel.send("Added a win to user")
        }
    },
    {
        name: "getcache",
        description: "Get user from cache",
        execute: async function (msg, args) {
            let result = await database.getUserCache(parseMsgMention(msg, args))
            console.log("Cache result:",result)
            msg.reply("See console")
        }
    }, {
        name: "getdatabase",
        description: "Get user from database",
        execute: async function (msg, args) {
            let result = await database.getUser(parseMsgMention(msg, args), true)
            console.log("Database result:",result)
            msg.reply("See console")
        }
    },
    {
        name: "add-money",
        alias: ["add"],
        description: "Add free money's",
        execute: async function (msg, args) {
            let result = await database.addBalance(parseMsgMention(msg, args), 1000000)
            console.log("Database result:",result)
            msg.reply("YOU BASTARD")
        }
    },
]


functions = functions.map(x=> {
    return {...x, admin: true}
})


module.exports = {
   functions,
    events: []
}