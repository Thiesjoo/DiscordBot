const repeater = require("./repeat-mock")

module.exports = {
    functions: [require("./binas"),require('./jacco-pesten'), repeater.toggle, repeater.activate, require("./water"), require("./stink"), ...require("./russian-roulette")],
    events: [repeater.event]
}