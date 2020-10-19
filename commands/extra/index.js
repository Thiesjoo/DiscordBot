const processMessage = require("../../messages/processMessage")

module.exports = {
    functions: [],
    events: [
        {
            name: "messageUpdate",
            execute: async (msgOld, msgNew, bot) => {
                if (msgNew.author.bot) return
                if (msgNew.content == msgOld.content) return
                
                //Check if old message was processed
                console.log("MSG EDITED")
                await processMessage(bot)(msgNew)
            }
        }
    ]
}