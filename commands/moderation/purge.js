const config = require("../../config");

module.exports = {
    name: "purge",
    description: "Purge last messages. Usage !purge <amount>, with 0<amount<100",
    perms: config.perms.admin,
    execute(msg, args) {
        let amount = parseInt(args[0])+1
        if (!amount || amount < 0 || amount > 100) {
            msg.reply("Not a valid number")
            return
        }
        msg.channel.messages.fetch({ limit: amount }).then(messages => { // Fetches the messages
            msg.channel.bulkDelete(messages // Bulk deletes all messages that have been fetched and are not older than 14 days (due to the Discord API)
            )
        });
    }
}