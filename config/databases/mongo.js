const { MongoClient } = require('mongodb');
const config = require('..');
const redis = require("../redisPUB")


let db = null //(db)
let users = null;

MongoClient.connect(
    // config.databaseURL,
    "mongodb://mongo:27017",
    { useNewUrlParser: true, useUnifiedTopology: true, connectTimeoutMS: 5000, socketTimeoutMS: 5000,serverSelectionTimeoutMS: 5000 })
    .then(result => {
        console.log("[MONGO] Connected to database:",config.databaseURL)
        config.ready.database = 1
        db = result.db("discord")
        users = db.collection("users")
    })
    .catch(err => {
        console.error("[MONGO]",err)
        config.ready.database = -1
    })


async function getUser(id, full = false) {
    if (!full) { //Get user out of cache. (When full profile is requested, we need to use the database)
        let result = await redis.hgetall(`disc:user:${id}`)
        if (result) {
            result.cached = true;
            return result    
        } 
    }

    let user = await users.findOne({ _id: id })

    if (!user) {
        throw new Error("User not found")
    }
    user.cached = false;

    await redis.hset(`disc:user:${id}`, `_id`, `${user._id}`, `balance`, `${user.balance}`, `symbol`, `${user.symbol}`)
    await redis.expire(`disc:user:${id}`, 60 * config.userExpiry)
    //User expires in 60 minutes.
    return user
}


class User {
    constructor(id,name, balance) {
        this._id = id
        this.name = name
        this.balance = balance
        this.wins = 0
        this.losses = 0
        this.symbol = name[0]
    }
}

async function createUser(id) {
    let newUser = new User(id, 20000)
    await users.insert(newUser)
    return newUser
}

async function wipeDatabase() {
    await users.remove()
}


module.exports = {
    getUser, createUser, wipeDatabase
}