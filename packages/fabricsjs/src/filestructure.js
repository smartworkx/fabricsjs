const config = require('./config')
const fs = require('fs')

function getGeneratedClientFile (fragmentName) {
  return `${config.distDir}/${fragmentName}-client.js`
}

function writeGeneratedClientFile (fragmentName, jsFileContent) {
  const distDir = config.distDir
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir)
  }
  fs.writeFileSync(getGeneratedClientFile(fragmentName), jsFileContent)
}
module.exports = {
  getGeneratedClientFile, writeGeneratedClientFile
}
