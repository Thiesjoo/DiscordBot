
const redisPub = require("./redisPUB")

const asyncRedis = require("async-redis");
const config = require(".");
const client = asyncRedis.createClient(config.redisURL);


client.on("error", function (err) {
    console.error("[REDIS] " + err);
    config.ready.redis = -1
    redisPub.publish("status:update", "redisSUB")

});
 
client.on("reconnecting", () => {
    config.ready.redis = 0
    redisPub.publish("status:update", "redisSUB")
})

client.on("ready", () => {
    console.log("[REDIS] Connected to:", config.redisURL)
    config.ready.redis = 1
})


module.exports = client