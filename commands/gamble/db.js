const config = require("../../config");

let test = null;

if (config.databaseType == "local") {
    test = require("./databases/local")
    
} else {
    console.error("CANNOT HANDLE THIS DATABASE TYPE")
    process.exit()
}

module.exports = test