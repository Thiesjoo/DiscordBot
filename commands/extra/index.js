const processMessage = require("../../messages/processMessage")

module.exports = {
    functions: [],
    events: [
        {
            name: "messageUpdate",
            execute: (msgOld, msgNew, bot) => {
                if (msgNew.author.bot || msgNew.deleted || msgNew.pinned) return
                
                //Check if old message was processed
                console.log("MSG EDITED", msgNew)
                processMessage(bot)(msgNew)
            }
        }
    ]
}