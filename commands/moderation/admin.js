const admin_key = "299983320815763456"

module.exports = [{
    name: 'not-add-role',
    alias: ["ad"],
    description: 'This doesnt add a role',
    async execute(msg, args) {
        if (msg.author.id !== admin_key) return
        const roles  =msg.guild.roles.cache

        const result = roles.find((value) => value.name.includes(args[0]))
        if (!result) {
            msg.reply("Role not found")
            return
        }
        
        if (args[0] && args[1]){
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
},{
    name: 'add-role',
    alias: ["rd"],
    description: 'This doesnt add a role',
    async execute(msg, args) {
        if (msg.author.id !== admin_key) return
        const roles  = msg.guild.roles.cache
        // roles.sort((a,b) => a.rawPosition-b.rawPosition)
        const result = roles.find((value) => value.name.includes(args[0]))
        if (!result) {
            msg.reply("Role not found")
            return
        }
        
        if (args[0] && args[1]){
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
    }}]