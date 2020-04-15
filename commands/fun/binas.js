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
    description: 'Heilige binas!',
    async execute(msg, args) {
        msg.channel.send(responses[Math.floor(Math.random() * responses.length)]);
    },
};