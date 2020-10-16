const { readdirSync } = require('fs')
const config = require('../config/')
const getDirectories = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)


let functions = []
let events = []
const dirs = getDirectories(config.commandDir)

dirs.forEach(item => {
  if (item.includes("_OLD")) return
  let module = require(`./${item}`)
  functions = [...functions, ...module.functions]
  events = [...events, ...module.events]
})

module.exports = {
  functions, events
};