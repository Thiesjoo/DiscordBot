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
 
function parseMsgMention(msg, args) {
    let mention = msg.author.id
    if (args[0]) {
        mention = parseMention(args[0], msg)
        if (!mention) return
    }
    return mention
}


function isAdmin(user) {
    return false
}

function getName(user) {

}

module.exports = { parseMention, parseMsgMention, isAdmin, getName }