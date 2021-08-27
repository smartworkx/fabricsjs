const webpack = require('webpack')
const config = require('./src/config')
const isObject = require('is-object')
const path = require('path')
const chokidar = require('chokidar')
const { merge } = require('webpack-merge')
const fs = require('fs')
const AssetsPlugin = require('assets-webpack-plugin')

const { forFragments } = require('./src/common')

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

const webPackConfig = {
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

const clientWebPackConfig = {
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

// wait for both promises
const prepare = (server) => {
  return new Promise((resolve, reject) => {
    if (config.dev) {
      webPackConfig.mode = 'development'

      clientWebPackConfig.mode = 'development'
      clientWebPackConfig.plugins = [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
      ]

      const clientCompiler = webpack(clientWebPackConfig)
      server.use(require('webpack-dev-middleware')(clientCompiler, { serverSideRender: true }))
      server.use(require('webpack-hot-middleware')(clientCompiler))

      const serverCompiler = webpack(webPackConfig)

      chokidar.watch('./src/fragments').on('change', async (event, path) => {
        const parts = event.split('/')
        const fragmentName = parts[parts.length - 2].replace('.js', '')
        console.log(`Fragment ${fragmentName} changed compiling and deleting from require cache`)
        await compileFragment(fragmentName)
        delete require.cache[require.resolve(`${config.distDir}/${fragmentName}`)]
      })

      serverCompiler.run((err, stats) => {
        if (err || stats.hasErrors()) {
          // Handle errors here
          stats.compilation.errors.forEach(error => console.log(error.message))
          console.log(`Error ${err}`)
          reject(err)
        } else {
          console.log('Done processing server')
          resolve()
        }
      })
    } else {
      let productionClientWebpackConfig = {
        ...clientWebPackConfig,
        mode: 'production'
      }
      productionClientWebpackConfig.plugins.push(new AssetsPlugin({
        prettyPrint: true,
        path: path.join(config.distDir)
      }))
      productionClientWebpackConfig.output.filename = '[name]-[chunkhash].js'
      if (config.webpack.client.production) {
        productionClientWebpackConfig = merge(productionClientWebpackConfig, config.webpack.client.production)
      }
      const compiler = webpack([
        productionClientWebpackConfig,
        {
          ...webPackConfig,
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
    }
  }
  )
}

const compileFragment = async function (fragmentName) {
  return new Promise((resolve, reject) => {
    const fragmentConfig = {
      ...webPackConfig,
      output: {
        ...webPackConfig.output,
        filename: `${fragmentName}.js`
      },
      entry: webPackConfig.entry[fragmentName]
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

module.exports = { prepare, getFragmentStream, getJsFileName, getCompiledFragmentPathname, getAssetConfig }
