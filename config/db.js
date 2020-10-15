const config = require(".");
const redis = require("./redisPUB")

let database = null;

if (config.databaseType == "local") {
    database = require("./databases/local")
    // config.ready.database = 1
} else {
    console.error("CANNOT HANDLE THIS DATABASE TYPE")
    config.ready.database = -1
}

redis.publish("status:update", "database")

database.mongo = require("./databases/mongo")

module.exports = database