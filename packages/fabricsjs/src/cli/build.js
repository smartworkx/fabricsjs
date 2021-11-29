const { build } = require('../webpack')
const { deleteFolderRecursive } = require('../common')
const { generateClientJs } = require('../client')
module.exports = async () => {
  deleteFolderRecursive()
  generateClientJs()
  await build()
}
