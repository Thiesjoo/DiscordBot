const db = require("../gamble/db")
const admin_key = "299983320815763456"

let repeat = false
let following = ""

module.exports = {
    activate: {
        name: 'activate-repeat',
        description: 'Mock someone by repeating their text. Usage: !activate-repeat @Ben',
        alias: ["ar", "a-r"],
        execute(msg, args) {
            if (msg.author.id == admin_key) {
                let mention = db.parseMention(args[0], msg)
                if (!mention) return

                following = mention
                msg.reply(`Mocking enabled`)
                repeat = true
            } else {
                msg.reply("Nice try mothafuka")
            }
        }
    },
    toggle: {
        name: 'toggle-repeat',
        alias: ["tr", "t-r"],
        description: 'Enable/disable repeat',
        execute(msg, args) {
            if (msg.author.id == admin_key) {
                repeat = !repeat
                msg.channel.send(`Mocking is currently: ${repeat ? "enabled":"disabled"}`);
            }
        },
    },
    event: {
        name: "message",
        execute(msg) {
            if (msg.author.id == following && repeat) {
                msg.channel.send(msg.content.split("").map(tweak).join(""))
            }
        }
    }
};


function tweak(c) {
    return Math.random() < 0.5 ? c.toLowerCase() : c.toUpperCase();
}