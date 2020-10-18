const config = require("..")
const redis = require("../redisPUB")
const User = require("./user")


//Cache
async function setUserCache(user) {
    await redis.hset(`disc:user:${user.id}`, `_id`, `${user._id}`, `balance`, `${user.balance}`, `symbol`, `${user.symbol}`, `name`, user.name)
    await expireCache(user.id)
}

async function setUserBalance(user) {
    await redis.hset(`disc:user:${user.id}`, `balance`, `${user.balance}`)
    await expireCache(user.id)
}

async function setStatus(id, status) {
    let current = await getUserCache(id);
    if (!current) throw new Error("Player not found in cache, cannot set status");

    await redis.hset(`disc:user:${id}`, `ingame`, status)
    await expireCache(id)
}


async function expireCache(id) {
    await redis.expire(`disc:user:${id}`, 60 * config.userExpiry)
    //User in cache expires in 60 minutes(See config.js). 
}

async function getUserCache(id) {
    let result = await redis.hgetall(`disc:user:${id}`);
    if (!(result && result.balance && result._id && result.symbol)) return undefined
    return new User(result.id, result.name, result.balance, undefined, undefined, result.symbol, result.ingame, result._id)
}

module.exports = {
    setUserCache,
    setUserBalance,
    setStatus,
    expireCache,
    getUserCache
}