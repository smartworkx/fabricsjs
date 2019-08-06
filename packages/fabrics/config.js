const path = require('path')
const config = require.main.require('./fabrics.config')

const defaultConfig = {
    assetPrefix: 'assets',
    distDir: path.join(process.cwd(), './dist'),
    fragmentsDir: path.join(process.cwd(), './fragments')
}

module.exports = {
    ...defaultConfig,
    ...config,
    dev: process.env.NODE_ENV !== 'production'
}