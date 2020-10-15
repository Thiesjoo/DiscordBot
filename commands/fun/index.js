const repeater = require("./repeat-mock")

const rr = require("./russian-roulette")

const rrFunctions = rr.functions;
const rrEvents = rr.events

module.exports = {
    functions: [require("./binas"), repeater.toggle, repeater.activate, require("./water"), ...rrFunctions],
    events: [repeater.event, ...rrEvents]
}