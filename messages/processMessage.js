const config = require("../config");

module.exports = (bot) => {
    return async function (msg) {
        if (msg.author.bot) return; //Do not reply to bots
        if (!config.globalChannels.includes(msg.channel.name)) return //Only be active in the channels specified in the config
        if (!msg.guild || !msg.member) return; //Do not respond to dm's and do not process messages from banned/removed users

        try {
            const myPerms = msg.channel.permissionsFor(msg.guild.me)

            if (myPerms.missing('SEND_MESSAGES').length > 0) throw new Error("Can't send msg's in this channel: " + msg.channel)
            if (myPerms.missing("MANAGE_MESSAGES").length > 0) throw new Error("Cannot manage messages in this channel: " + msg.channel.id)
            if (myPerms.missing('ADD_REACTIONS').length > 0) throw new Error("Cannot add reactions in this channel: " + msg.channel)
        } catch (err) {
            console.error(err)
            msg.channel.send(err.message)
        }

        if (msg.content[0] == "!") {
            const temp = msg.content.substr(1)
            const args = temp.split(/ +/);
            const command = args.shift().toLowerCase();

            if (command == "help" || command == "h") {
                msg.channel.send({
                    embed: {
                        color: 3447003,
                        title: "Commands",
                        fields: bot.helpText
                    }
                })
                return
            }


            try {
                let commandFunction;
                if (!(command in bot.commands)) {
                    let alias = Object.values(bot.commands).find(x => {
                        return x.alias && x.alias.includes(command)
                    })

                    if (alias) {
                        commandFunction = alias
                    } else {
                        msg.reply("That command does not exist. Type !help for help")
                        return
                    }
                } else {
                    commandFunction = bot.commands[command]
                }

                if (commandFunction.perms) {
                    let allRoles = msg.guild.roles.cache;
                    let highest = msg.member.roles.highest;

                    let highPos = highest.rawPosition; //Highest role of the member sending this message

                    let allowedRole = allRoles.find(x => x.name == commandFunction.perms)
                    if (!allowedRole) throw new Error(`${commandFunction.perms} role was not found in this guild`)
                    if (highPos < allowedRole.rawPosition) throw new Error("No perms")
                }
                if (commandFunction.admin) {
                    if (msg.author.id !== config.adminUser) throw new Error("No perms")
                }

                await commandFunction.execute(msg, args, bot)

            } catch (error) {
                if (error.message == "User not found") {
                    msg.delete()
                    msg.reply("That user doesn't exist, or doesn't have an account with this bot yet.")
                } else if (error.message == "No perms") {
                    msg.author.send("You do not have permission to use: "+command+" in this server")
                    msg.delete()
                } else {
                    console.error(error);
                    msg.reply('There was an error trying to execute something with that command!');
                }
            }
        }
    }
}