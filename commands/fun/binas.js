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
        // msg.guild.roles.fetch()
        //     .then(roles => {
        //         console.log(`There are ${roles.cache.size} roles.`)
        //         msg.guild.roles.fetch(roles.cache[0]).then(test => {
        //             console.log(test)
        //         })
        //     })
        //     .catch(console.error);
    },
};