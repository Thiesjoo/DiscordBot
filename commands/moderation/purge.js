module.exports = {
    name: "purge",
    description: "Purge last messages. Usage !purge <amount>, with 0<amount<100",
    execute(msg, args) {
        let amount = parseInt(args[0])
        if (!amount && amount > 0 && amount < 100) msg.reply("Not a valid number")
        if(args[1]) {
            msg.guild.channels
        }

        msg.channel.messages.fetch({ limit: amount }).then(messages => { // Fetches the messages
            msg.channel.bulkDelete(messages // Bulk deletes all messages that have been fetched and are not older than 14 days (due to the Discord API)
        )});
    }
}