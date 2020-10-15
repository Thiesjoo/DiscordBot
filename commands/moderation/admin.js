const config = require("../../config")

module.exports = [{
    name: 'add-role',
    alias: ["ad"],
    description: 'Add role to a user that is mentioned. (ADMIN)',
    async execute(msg, args) {
        if (msg.author.id !== config.adminUser) return
        const roles = msg.guild.roles.cache

        const result = roles.find((value) => value.name.includes(args[0]))
        if (!result) {
            msg.reply("Role not found")
            return
        }

        if (args[0] && args[1]) {
            //Role and mention
            const user = msg.mentions.users.first();
            const member = msg.guild.member(user)
            member.roles.add(result)
        } else if (args[0]) {
            //Only role
            console.log(result, msg.member.roles)
            msg.member.roles.add(result)
        } else {
            console.log("Wut")
        }
    },
}, {
    name: 'remove-role',
    alias: ["rd"],
    description: 'Remove a role from a user that is mentioned. (ADMIN)',
    async execute(msg, args) {
        if (msg.author.id !== config.adminUser) return

        const roles = msg.guild.roles.cache
        const result = roles.find((value) => value.name.includes(args[0]))
        if (!result) {
            msg.reply("Role not found")
            return
        }

        if (args[0] && args[1]) {
            //Role and mention
            const user = msg.mentions.users.first();
            const member = msg.guild.member(user)
            member.roles.remove(result)
        } else if (args[0]) {
            //Only role
            console.log(result, msg.member.roles)
            msg.member.roles.remove(result)
        } else {
            console.log("Wut")
        }
    }
}]