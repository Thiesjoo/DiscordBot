const processMessage = require("../../messages/processMessage")

module.exports = {
    functions: [],
    events: [
        {
            name: "messageUpdate",
            execute: (msgOld, msgNew, bot) => {
                //Check if old message was processed
                console.log("MSG EDITED", msgNew)
                processMessage(bot)(msgNew)
            }
        }
    ]
}