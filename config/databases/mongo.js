const { MongoClient } = require('mongodb');
const config = require('..');
const {
    setUserCache,
    setUserBalance,
    setStatus,
    getUserCache
} = require("./cache")
const User = require("./user")

let db = null //(db)
let users = null; //the collection out of the db
//It is safe to let these values be null, because the app will not respond to commands before the database is initialized

MongoClient.connect(
    config.databaseURL,
    { useNewUrlParser: true, useUnifiedTopology: true, connectTimeoutMS: 5000, socketTimeoutMS: 5000, serverSelectionTimeoutMS: 5000 })
    .then(result => {
        db = result.db("discord")
        users = db.collection("users")
        config.ready.database = 1
        console.log("[MONGO] Connected to database:", config.databaseURL)
    })
    .catch(err => {
        config.ready.database = -1
        console.error("[MONGO]", err)
    })




async function createUser(id, name) {
    let oldUser = null;
    try {
        oldUser = await getUser(id, true, true);
    } catch { }

    if (oldUser) throw new Error("User already exist" + id)
    let newUser = new User(id, name, 20000, 0, 0)
    await users.insertOne(newUser)

    await setUserCache(newUser)

    return newUser
}

async function getUser(id, full = false, createCall=false) {
    //TODO: Make name correct
    if (!full) { //Get user out of cache. (When full profile is requested, we need to use the database. For things like wins and loss updates)
        let result = await getUserCache(id);
        if (result) {
            result.cached = true;
            result.id = id
            return result
        }
    }

    let user = await users.findOne({ id })
    if (!user && !createCall) {
        console.log("Creating new user: ",)
        user = await createUser(id, "SET NAME: !bal")
        // throw new Error("User not found")
    } else {
        await setUserCache(user)
    }
    user.cached = false;
    return user
}

async function mongoUpdate(id, update) {
    let mongoResult = await users.findOneAndUpdate({ id }, update, { returnOriginal: false })
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
    await setUserBalance(result) //Update cache accordingly
    return result
}

async function updateSymbol(id, symbol) {
    if (!symbol) throw new Error("[UPDATESYMBOL] No symbol provided")
    let result = await mongoUpdate(id, { $set: { symbol } })

    await setUserCache(result) //Update cache accordingly
    return result
}

//Leaderboard
async function getLeaderboard(type, query = -1) {
    return users.find({}).sort({ [type]: query }).limit(5).toArray()
}


//Admin

async function wipeDatabase() {
    await users.deleteMany({})
}





module.exports = {
    getUser, createUser, updateSymbol,

    //Win stuff
    addLoss, addWin, addBalance,
    getLeaderboard,
    setStatus,


    //Admin
    wipeDatabase, getUserCache
}