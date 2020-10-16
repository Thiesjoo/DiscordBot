let functions = [require("./purge"), require("./ping"), ...require("./admin")];

functions = functions.map(x=> {
    return {...x, admin: true}
})

module.exports = {
    functions,
    events: []
}