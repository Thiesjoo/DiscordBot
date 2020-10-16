const { MongoClient } = require('mongodb');
const config = require('..');
const { getName } = require('../../messages/helper');
const redis = require("../redisPUB")


let db = null //(db)
let users = null;

MongoClient.connect(
    config.databaseURL,
    // "mongodb://mongo:27017",
    { useNewUrlParser: true, useUnifiedTopology: true, connectTimeoutMS: 5000, socketTimeoutMS: 5000, serverSelectionTimeoutMS: 5000 })
    .then(result => {
        console.log("[MONGO] Connected to database:", config.databaseURL)
        config.ready.database = 1
        db = result.db("discord")
        users = db.collection("users")
    })
    .catch(err => {
        console.error("[MONGO]", err)
        config.ready.database = -1
    })




class User {
    constructor(id, name, balance, wins = undefined, losses = undefined, symbol = "", _id = null) {
        this.id = id
        this.name = name
        this.balance = parseInt(balance)
        this.wins = wins
        this.losses = losses
        this.symbol = symbol ? symbol : name[0]
        this._id = _id
    }
}

async function createUser(id, name) {
    let oldUser = null;
    try {
        oldUser = await getUser(id, true);
    } catch { }

    if (oldUser) throw new Error("User already exist" + id)
    let newUser = new User(id, name, 20000, 0, 0)
    await users.insertOne(newUser)

    await setUserCache(newUser)

    return newUser
}

async function getUser(id, full = false) {  
    if (!full) { //Get user out of cache. (When full profile is requested, we need to use the database. For things like wins and loss updates)
        let result = await getUserCache(id);
        if (result) {
            result.cached = true;
            result.id = id
            return result
        }
    }
    
    let user = await users.findOne({ id })
    if (!user) {
        throw new Error("User not found")
    }
    await setUserCache(user)
    user.cached = false;
    return user
}

async function mongoUpdate(id, update) {
    let mongoResult = await users.findOneAndUpdate({ id }, update, {returnOriginal: false})
    if (!mongoResult.value) throw new Error("[MONGO] Update didn't work in mongo.js")
    return mongoResult.value
}

async function addWin(id) {
    return await mongoUpdate(id, { $inc: { wins: 1 } })
}

async function addLoss(id) {
    return await mongoUpdate(id, { $inc: { losses: 1 } })
}


async function addBalance(id, delta) {
    if (!delta) throw new Error("[ADDBALANCE] No delta provided")
    let result = await mongoUpdate(id, { $inc: { balance: delta } })
    await setUserCache(result) //Update cache accordingly
    return result
}

async function updateSymbol(id, symbol) {
    if (!symbol) throw new Error("[UPDATESYMBOL] No symbol provided")
    let result = await mongoUpdate(id, { $set: { symbol } })

    await setUserCache(result) //Update cache accordingly
    return result
}

//Leaderboard
async function getLeaderboard(type,query=-1) {
    return users.find({}).sort({[type]:query}).limit(5).toArray()
}


//Admin

async function wipeDatabase() {
    await users.deleteMany({})
}


//Cache

async function setUserCache(user) {
    await redis.hset(`disc:user:${user.id}`, `_id`, `${user._id}`, `balance`, `${user.balance}`, `symbol`, `${user.symbol}`)
    // await redis.expire(`disc:user:${user.id}`, 60 * config.userExpiry)
    //User in cache expires in 60 minutes(See config.js).
}

async function getUserCache(id) {
    let result = await redis.hgetall(`disc:user:${id}`);
    if (!(result && result.balance && result._id && result.symbol))  return undefined
    return new User(result.id, result.name, result.balance, undefined, undefined, result.symbol, result._id)
}

module.exports = {
    getUser, createUser, updateSymbol,

    //Win stuff
    addLoss, addWin, addBalance,
    getLeaderboard,


    //Admin
    wipeDatabase, getUserCache
}