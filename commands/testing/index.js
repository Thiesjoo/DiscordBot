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
                    case "mongo":
                        await database.mongo.wipeDatabase()
                }
            } else {
                await redis.flushall()
                await database.mongo.wipeDatabase()
            }
            msg.channel.send("Lol")
        }
    },
    {
        name: "getuser",
        description: "Get user",
        execute: async function (msg, args) {
            let result = await database.mongo.getUser(parseMsgMention(msg, args))
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
            let result = await database.mongo.createUser(mention, await getName(mention, msg))
            console.log(result)
            msg.channel.send("New user created")
        }
    },
    {
        name: "win",
        description: "yes",
        execute: async function (msg, args) {
            //Create account for current user
            let result = await database.mongo.addWin(msg.author.id)
            console.log("Win result:", result)
            msg.channel.send("Added a win to user")
        }
    },
    {
        name: "getcache",
        description: "Get user from cache",
        execute: async function (msg, args) {
            let result = await database.mongo.getUserCache(parseMsgMention(msg, args))
            console.log("Cache result:",result)
            msg.channel.send(`The result was ${result.cached ? "" : "not "}cached` )
        }
    }, {
        name: "getdatabase",
        description: "Get user from datavase",
        execute: async function (msg, args) {
            let result = await database.mongo.getUser(parseMsgMention(msg, args), true)
            console.log("Database result:",result)
        }
    },
    {
        name: "add",
        description: "Get user from datavase",
        execute: async function (msg, args) {
            let result = await database.mongo.addBalance(parseMsgMention(msg, args), -11000)
            console.log("Database result:",result)
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