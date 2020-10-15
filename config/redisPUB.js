const asyncRedis = require("async-redis");
const config = require(".");
const client = asyncRedis.createClient(config.redisURL);

module.exports = client