const { readdirSync } = require('fs')
const getDirectories = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)


let functions = []
let events = []
const dirs = getDirectories("./commands")

dirs.forEach(item => {
  let module = require(`./${item}`)
  functions = [...functions, ...module.functions]
  events = [...events, ...module.events]
})

module.exports = {
  functions, events
};