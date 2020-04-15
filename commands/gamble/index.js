global.user_cache = {}

module.exports = {
    functions: [...require("./balance"), ...require("./games"), ],
    events: []
}