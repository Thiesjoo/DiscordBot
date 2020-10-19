const { getUser, updateName } = require("../../config/db")
const { getName, parseMsgMention } = require("../../messages/helper")

module.exports = {
    name: 'name',
    description: 'Set name, based on nickname ',
    async execute(msg, args) {
        let mention = parseMsgMention(msg, args)
        let user = await getUser(mention)

        if (user) {
            let newName = await getName(mention, msg)
            let result = await updateName(mention, newName)
            msg.reply("Changed your name to: " + result.name)
            return
        } else {
            msg.reply("User doesn't exist")
        }

    },
}