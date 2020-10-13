const repeater = require("./repeat-mock")

const rr = require("./russian-roulette")

const rrFunctions = rr.functions;
const rrEvents = rr.events

module.exports = {
    functions: [require("./binas"),require('./jacco-pesten'), repeater.toggle, repeater.activate, require("./water"), require("./stink"), ...rrFunctions],
    events: [repeater.event, ...rrEvents]
}