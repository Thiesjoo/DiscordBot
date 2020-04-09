let responses = ["Jacco houd van Rachel(Uitgesproken als Ragel)",
    "Jacco houdt van wesley",
    "Jacco houdt van tygo",
    "macFrap is een big nigga",
    "Sjut hup",
    "Sjut up",
    "Jacco big dum dum",
    "Jacco has the big dum",
    "stop",
    "nee",
    "nee",
    "ja",
    "cco",
    "Flikker op"]

let jaccoId = "694164639709265930"

module.exports = {
    name: 'jacco',
    description: 'We love Jacco!',
    async execute(msg, args) {
        msg.channel.send(`<@${jaccoId}> ` + responses[Math.floor(Math.random() * responses.length)]);
    },
};

