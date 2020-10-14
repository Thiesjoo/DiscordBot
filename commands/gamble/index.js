global.user_cache = {} //FIXME: Stop depending on global object

module.exports = {
    functions: [...require("./balance"), ...require("./games"), ],
    events: []
}