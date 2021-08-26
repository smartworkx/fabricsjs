const path = require('path')
let workingDir = process.cwd()
const config = require.main.require(`${workingDir}/fabrics.config`)

const defaultConfig = {
    assetPrefix: 'assets',
    distDir: path.join(workingDir, './dist'),
    fragmentsDir: path.join(workingDir, './src/fragments')
}

module.exports = {
    ...defaultConfig,
    ...config,
    dev: process.env.NODE_ENV !== 'production'
}