const webpack = require('webpack')
const path = require('path')
const AssetsPlugin = require('assets-webpack-plugin')
const assetDirName = 'dist'
const assetsPath = path.join(__dirname, '/' + assetDirName)
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
module.exports = {
  mode: 'production',
  entry: {
    react17: [
      'react',
      'react-dom',
    ]
  },
  output: {
    path: assetsPath,
    filename: '[name]_[fullhash].bundle.js',
    publicPath: assetDirName,
    library: '[name]'
  },
  plugins: [
    new webpack.DllPlugin({
      name: '[name]',
      path: `${assetsPath}/main-manifest.json`
    }),
    new AssetsPlugin({
      prettyPrint: true,
      path: path.join(__dirname, assetDirName)
    }),
    new BundleAnalyzerPlugin()
  ],
}