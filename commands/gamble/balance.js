const db = require("./db")


module.exports = {
    name: 'balance',
    alias: ["bal"],
    description: 'Balance check',
    async execute(msg, args) {
        let user = await db.initUser(msg.author.id)
        msg.reply(`Your balance is: $${user.balance}`);
    },
};