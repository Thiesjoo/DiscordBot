const responses = [
    "Bi-nasi",
    "Bi-naan",
    "Binasappel",
    "Binananas",
    "bi-nee",
    "bi-ja",
    "bi-naise",
    "bio-naise"]

module.exports = {
    name: 'binas',
    description: 'Holy binas! (Binas is a school book that helps you with Physics, chemistry and biology.)',
    async execute(msg, args) {
        msg.channel.send(responses[Math.floor(Math.random() * responses.length)]);
    },
};