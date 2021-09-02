const webpack = require('webpack')
const config = require('./config')
const isObject = require('is-object')
const path = require('path')
const chokidar = require('chokidar')
const { merge } = require('webpack-merge')
const fs = require('fs')
const AssetsPlugin = require('assets-webpack-plugin')

const { forFragments } = require('./common')

let assets = null
const getFragments = () => {
  const fragmentEntries = {}
  forFragments((fragmentName) => {
    const fragmentPath = `${config.fragmentsDir}/${fragmentName}`
    const entries = [fragmentPath]
    fragmentEntries[`${fragmentName}`] = entries
  })
  return fragmentEntries
}

const webpackConfig = {
  entry: getFragments(),
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      }
    ]
  },
  output: {
    libraryTarget: 'commonjs2',
    path: config.distDir
  }
}

function getClientFragments () {
  const fragmentEntries = {}
  forFragments((fragmentName) => {
    const fragmentPath = `${config.distDir}/${fragmentName}-client`
    const entries = []
    if (config.dev) {
      entries.push('webpack-hot-middleware/client')
    }
    entries.push(fragmentPath)
    fragmentEntries[`${fragmentName}`] = entries
  })
  return fragmentEntries
}

const clientWebpackConfig = {
  entry: getClientFragments(),
  output: {
    publicPath: '/',
    path: config.distDir + '/client'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      }
    ]
  },
  plugins: []
}

const buildProduction = () => {
  return new Promise((resolve, reject) => {
    let productionClientWebpackConfig = {
      ...clientWebpackConfig,
      mode: 'production'
    }
    productionClientWebpackConfig.plugins.push(new AssetsPlugin({
      prettyPrint: true,
      path: path.join(config.distDir)
    }))
    productionClientWebpackConfig.output.filename = '[name]-[chunkhash].js'
    if (config.webpack && config.webpack.client && config.webpack.client.production) {
      productionClientWebpackConfig = merge(productionClientWebpackConfig, config.webpack.client.production)
    }
    const compiler = webpack([
      productionClientWebpackConfig,
      {
        ...webpackConfig,
        mode: 'production'
      }
    ])
    compiler.run((err, stats) => {
      if (err || stats.hasErrors()) {
        // Handle errors here
        stats.compilation.errors.forEach(error => console.log(error.message))
        console.log(`Error ${err}`)
        reject(err)
      } else {
        console.log('Done processing processing client and server')
        resolve()
      }
    })
  })
}

// wait for both promises
const prepare = (server) => {
  return new Promise((resolve, reject) => {
      if (config.dev) {
        console.log(`Preparing in dev mode`)
        webpackConfig.mode = 'development'

        clientWebpackConfig.mode = 'development'
        clientWebpackConfig.plugins = [
          new webpack.HotModuleReplacementPlugin(),
          new webpack.NoEmitOnErrorsPlugin()
        ]

        const clientCompiler = webpack(clientWebpackConfig)
        server.use(require('webpack-dev-middleware')(clientCompiler, { serverSideRender: true }))
        server.use(require('webpack-hot-middleware')(clientCompiler))

        const serverCompiler = webpack(webpackConfig)

        chokidar.watch('./src/fragments').on('change', async (event, path) => {
          const parts = event.split('/')
          const fragmentName = parts[parts.length - 2].replace('.js', '')
          console.log(`fragment ${fragmentName} changed compiling and deleting from require cache`)
          await compileFragment(fragmentName)
          delete require.cache[require.resolve(`${config.distDir}/${fragmentName}`)]
        })

        serverCompiler.run((err, stats) => {
          if (err || stats.hasErrors()) {
            // handle errors here
            stats.compilation.errors.forEach(error => console.log(error.message))
            console.log(`error ${err}`)
            reject(err)
          } else {
            console.log('done processing server')
            resolve()
          }
        })
      }else {
        resolve()
      }
    }
  )
}

const compileFragment = async function (fragmentName) {
  return new Promise((resolve, reject) => {
    const fragmentConfig = {
      ...webpackConfig,
      output: {
        ...webpackConfig.output,
        filename: `${fragmentName}.js`
      },
      entry: webpackConfig.entry[fragmentName]
    }
    webpack([fragmentConfig], (err, stats) => {
      if (err || stats.hasErrors()) {
        // Handle errors here
        console.log(`Error ${err}`)
        if (stats.compilation) {
          stats.compilation.errors.forEach(error => console.log(error.message))
        }
        reject(err)
      } else {
        console.log(`Done processing server ${fragmentName}`)
        resolve()
      }
    })
  })
}

function normalizeAssets (assets) {
  if (isObject(assets)) {
    return Object.values(assets)
  }

  return Array.isArray(assets) ? assets : [assets]
}

function getFragmentStream (webDevMiddleWareWebpack, fragmentName) {
  const { devMiddleware } = webDevMiddleWareWebpack
  const outputFileSystem = devMiddleware.outputFileSystem
  const jsonWebpackStats = devMiddleware.stats.toJson()
  const { assetsByChunkName, outputPath } = jsonWebpackStats
  const fileName = normalizeAssets(assetsByChunkName[fragmentName])[0]
  return outputFileSystem.createReadStream(path.join(outputPath, fileName))
}

const getJsFileName = (webpack, fragmentName) => {
  const { devMiddleware } = webpack
  const jsonWebpackStats = devMiddleware.stats.toJson()
  const { assetsByChunkName } = jsonWebpackStats
  return normalizeAssets(assetsByChunkName[fragmentName])
}

function getCompiledFragmentPathname (fragmentName) {
  return `${config.distDir}/${fragmentName}`
}

function getAssetConfig (fragmentName) {
  if (assets == null) {
    const contents = fs.readFileSync(`${config.distDir}/webpack-assets.json`, { encoding: 'utf8' })
    assets = JSON.parse(contents)
  }
  const assetName = `${fragmentName}`
  const assetConfig = assets[assetName]
  if (!assetConfig) {
    throw new Error(`ERROR, Cannot find ${assetName} in assets.json`)
  }
  return assetConfig
}

module.exports = { prepare, getFragmentStream, getJsFileName, getCompiledFragmentPathname, getAssetConfig, build: buildProduction }
