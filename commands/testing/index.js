const database = require('../../config/db')
const redis = require('../../config/redisPUB')
const { parseMsgMention, getName } = require('../../messages/helper')

module.exports = {
    functions: [
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
            name: "mongo",
            description: "yes",
            execute: async function (msg, args) {
                let result = await database.mongo.getUser(parseMsgMention(msg, args))
                console.log(result)
                msg.channel.send(result.cached)
            }
        },
        {
            name: "mongo1",
            description: "yes",
            execute: async function (msg, args) {
                //Create account for current user
                let result = await database.mongo.createUser(msg.author.id, getName(msg.author))
                console.log(result)
            }
        }
    ],
    events: []
}