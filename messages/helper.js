// Get the user that is mentioned
function parseMention(mention, msg) {
    if (!mention) {
        msg.reply("You have to mention someone in the first argument")
        return false
    }
    if (mention.startsWith('<@') && mention.endsWith('>')) {
        mention = mention.slice(2, -1);
        if (mention.startsWith('!')) {
            mention = mention.slice(1);
        } else if (mention.startsWith("&")) {
            msg.reply("You can't mention roles")
            return false
        }
    } else {
        msg.reply("Invalid mention")
        return false
    }
    return mention
}
 
//Check if argument is given, and then parse mention
function parseMsgMention(msg, args) {
    let mention = msg.author.id
    if (args[0]) {
        mention = parseMention(args[0], msg)
        if (!mention) return
    }
    return mention
}


function isNum(num) {
    return !isNaN(num)
}

function isAdmin(user) {
    return false
}

async function getName(mention, msg) {
    let guildmember = await msg.guild.members.fetch(mention);
    let name = guildmember.nickname
    if(!name) name = guildmember.user.username
    return name
}

module.exports = { 
    parseMention, parseMsgMention, 
    
    isAdmin, 
    
    //User stuff
    getName,

    //Validation
    isNum,
}