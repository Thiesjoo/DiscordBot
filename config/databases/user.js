class User {
    constructor(id, name, balance, wins = undefined, losses = undefined, symbol = "", ingame = "", _id = null) {
        this.id = id
        this.name = name
        this.balance = parseInt(balance)
        this.wins = wins
        this.losses = losses
        this.symbol = symbol ? symbol : name[0]
        this._id = _id
        this.ingame = ingame
    }
}

module.exports = User