const repeater = require("./repeat-mock")

module.exports = {
    functions: [require("./binas"),require('./jacco-pesten'), repeater.toggle, repeater.activate],
    events: [repeater.event]
}