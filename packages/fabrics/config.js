const path = require('path')
const workingDir = process.cwd()
const config = require.main.require(`${workingDir}/fabrics.config`)

const defaultConfig = {
  assetHost: process.env.ASSET_HOST || 'http://localhost:3000',
  assetPrefix: process.env.ASSET_PREFIX || 'assets',
  distDir: path.join(workingDir, './dist'),
  fragmentsDir: path.join(workingDir, './src/fragments')
}

module.exports = {
  ...defaultConfig,
  ...config,
  dev: process.env.NODE_ENV !== 'production'
}
