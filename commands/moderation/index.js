let functions = [require("./purge"), require("./ping"), ...require("./admin")];

functions = functions.map(x=> {
    return {...x, admin: true}
})
functions.push(require("./changeName"))

module.exports = {
    functions,
    events: []
}