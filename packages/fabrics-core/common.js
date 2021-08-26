const fs = require('fs')
const config = require('./config')

const getStateName = (fragmentName) => `__FABRICS_STATE_${fragmentName}__`

const forFragments = fn => {
    fs.readdirSync(config.fragmentsDir).forEach(function (file) {
        const fileName = file.split('.')
        const fragmentName = fileName[0]
        fn(fragmentName)
    })
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

module.exports = {
    getStateName,
    forFragments,
    deleteFolderRecursive
}
