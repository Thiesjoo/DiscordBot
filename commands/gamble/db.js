const Datastore = require('nedb-promises')

const users = new Datastore({ filename: 'db/users.db', autoload: true });
const startingBalance = 20000


class User {
    constructor(id, balance) {
        this._id = id
        this.balance = balance
        this.wins = 0
        this.losses = 0
    }
}


async function createUser(id) {
    let newUser = new User(id, startingBalance)
    try {
        await users.insert(newUser)
        return newUser
    } catch (error) {
        console.error("Creating failed: ",error)
    }
}

async function getUser(id) {
    try {
        return users.findOne({_id: id })
    } catch {
        console.error("Couldn't get user")
    }
}

module.exports = {
    async initUser(id) {
        console.log(await users.count({_id: "299983320815763456"}))

        let user = await getUser(id)
        if (!user) user = await createUser(id)
        return user
    },

    async updateUser(id, newUser) {
        return users.update({_id: id}, newUser)
    }

}