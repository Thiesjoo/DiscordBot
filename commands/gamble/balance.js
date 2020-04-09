
module.exports = {
    name: 'balance',
    description: 'Balance check',
    execute(msg, args) {
        msg.reply(`Your balance is: ${"0 points"}`);
    },
};