const fs = require('fs')
const config = require('./config')

const getStateName = (fragmentName) => `__FABRICS_STATE_${fragmentName}__`

const getFragmentNames = () => {
  const fragmentNames = []

  for (const file of fs.readdirSync(config.fragmentsDir)) {
    const fileName = file.split('.')
    const fragmentName = fileName[0]
    fragmentNames.push(fragmentName)
  }

  return fragmentNames
}

const forFragments = fn => {
  for (const fragmentName of getFragmentNames()) {
    fn(fragmentName)
  }
}

const deleteFolderRecursive = path => {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file, index) {
      const curPath = path + '/' + file
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath)
      } else { // delete file
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(path)
  }
}

const requireFragmentServerJs = (fragmentName) => {
  return require(`${process.cwd()}/src/fragments/${fragmentName}/server`)
}

module.exports = {
  getStateName,
  forFragments,
  getFragmentNames,
  deleteFolderRecursive,
  requireFragmentServerJs
}
