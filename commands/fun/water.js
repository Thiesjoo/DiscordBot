let water = false

const responses = ["Neem een slokje water!","Tijd om wat te drinken", "Stay hydrated!", "Bish go hydrate yourself", "Time for a sip", "Neem een slokje", "Tijd voor water", "DRINK WATER GODVERDOMME"]
let timeout
let delay = 600_000 //10 minutes 


module.exports = {
    name: 'water',
    description: 'A friendly water reminder',
    async execute(msg, args) {
        if (water) {
            clearInterval(timeout)
        } else {
            timeout = setInterval(x => {
                console.log("Triggered")
                msg.channel.send("@everyone " +responses[Math.floor(Math.random() * responses.length)]);
            }, delay)
        }
        water = !water
    },
};