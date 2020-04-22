module.exports = {
    functions:[require("./purge"), require("./ping"), ...require("./admin")],
    events: []
}