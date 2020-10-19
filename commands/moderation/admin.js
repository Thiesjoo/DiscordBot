const config = require("../../config")
const Discord = require('discord.js');

module.exports = [{
    name: 'add-role',
    alias: ["ad"],
    description: 'Add role to a user that is mentioned. (ADMIN)',
    perms: config.perms.admin,
    admin: true,
    async execute(msg, args) {
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
        msg.delete()
    },
}, {
    name: 'remove-role',
    alias: ["rd"],
    description: 'Remove a role from a user that is mentioned. (ADMIN)',
    perms: config.perms.admin,
    admin: true,
    async execute(msg, args) {

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
            console.log("Please provide commands")
        }
        msg.delete()
    }
},

{
    name: 'create-role',
    alias: ["cr"],
    description: 'Create a new role (ADMIN)',
    perms: config.perms.admin,
    admin: true,
    async execute(msg, args, bot) {
        try {
            const roles = msg.guild.roles
            let result = await roles.create({
                data: {
                    name: args[0],
                    position: msg.guild.me.roles.highest.rawPosition,
                    permissions: msg.guild.me.roles.highest.permissions
                }
            })

            if (args[1]) {
                //Role and mention
                const user = msg.mentions.users.first();
                const member = msg.guild.member(user)
                member.roles.add(result)
            } else {
                console.log("Role created, but not added to someone")
            }
        } catch (err) {
            console.error(err)
        }
        msg.delete()
    }
},
{
    name: 'delete-role',
    alias: ["dr"],
    description: 'Delete a role (ADMIN)',
    perms: config.perms.admin,
    admin: true,
    async execute(msg, args, bot) {

        const roles = msg.guild.roles.cache
        let result = roles.find(x => x.name == args[0])
        if (result) {
            console.log("Deleted role: ", result.name)
            result.delete()
        } else {
            console.log("Role not found")
        }
        msg.delete()
    }
},
{
    name: 'info-role',
    alias: ["ir"],
    description: 'Info about a role (ADMIN)',
    admin: true,
    async execute(msg, args, bot) {
        console.log( msg.guild.me.roles.highest.permissions.toArray())
        msg.delete()
    }
},
{
    name: 'bully-user',
    alias: ["bu"],
    description: 'Bully a user by tag (ADMIN)',
    admin: true,
    async execute(msg, args, bot) {
        if (!args[0]) {
            let result = await bot.users.fetch(config.bullyUser)
            console.log(result)
            if (result) {
                result.send("Ur mom gay")
            }
        } else {
            const user = msg.mentions.users.first();
            const member = msg.guild.member(user)
            member.send("Ur mom gay")
        }
        msg.delete()
    }  
}
]