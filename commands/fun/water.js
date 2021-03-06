const config = require("../../config");

let water = false

const responses = ["Take a sip!", "Stay hydrated!", "Bish go hydrate yourself", "Drink some water!", ]
let timeout
let delay = config.waterDelay //10 minutes 


module.exports = {
    name: 'water',
    description: 'A friendly water reminder',
    async execute(msg, args) {
        if (water) {
            clearInterval(timeout)
            msg.channel.send("Water reminders turned off")
        } else {
            timeout = setInterval(x => {
                console.log("Water timer triggerd")
                msg.channel.send("@everyone " +responses[Math.floor(Math.random() * responses.length)]);
            }, delay)
            msg.channel.send("There will be water reminders every 10 minutes from now on")
        }
        water = !water
    },
};