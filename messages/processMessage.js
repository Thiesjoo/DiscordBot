module.exports = (bot) => {


    return function (msg) {
        if (msg.author.bot) return;
        if (msg.channel.name !== "gambling" && msg.channel.name !== "testing") return
        if (!msg.guild) return;

        const myPerms = msg.channel.permissionsFor(msg.guild.me)

        // We don't want the bot to do anything further if it can't send msgs in the channel
        if (myPerms.missing('SEND_MESSAGES').length > 0) {
            console.error("Can't send msg's in this channel: ", msg.channel)
            return
        };

       // Here we check if the bot can actually add reactions in the channel the command is being ran in
        if (myPerms.missing('ADD_REACTIONS').length > 0) {
            console.error("Cannot add reactions in this channel: ", msg.channel)
            return
        }
        if (myPerms.missing("MANAGE_MESSAGES").length > 0) {
            console.error("Cannot manage messegas in this channel: ", msg.channel)
            return
        }


        if (msg.content[0] == "!") {
            const temp = msg.content.substr(1)
            const args = temp.split(/ +/);
            const command = args.shift().toLowerCase();
            // console.info(`Called command: ${command}`);

            if (command == "help" || command == "h") {
                msg.channel.send({
                    embed: {
                        color: 3447003,
                        title: "Commands",
                        fields: helpText
                    }
                })
                return
            }


            try {
                if (!(command in bot.commands)) {
                    let alias = Object.values(bot.commands).find(x => {
                        return x.alias && x.alias.includes(command)
                    })

                    if (alias) {
                        alias.execute(msg, args)
                    } else {
                        msg.reply("That command does not exist. Type !help for help")
                    }
                } else {
                    bot.commands[command].execute(msg, args);
                }



            } catch (error) {
                console.error(error);
                msg.reply('there was an error trying to execute that command!');
            }
        }
    }
}