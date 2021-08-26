const webpack = require('webpack')
const config = require('./config')
const isObject = require('is-object')
const path = require('path')
const chokidar = require('chokidar')
const { forFragments } = require('./common')

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
  }
}

// wait for both promises
const prepare = (server) => {
  return new Promise(async (resolve, reject) => {
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

        chokidar.watch('.').on('change', async (event, path) => {
          if (event.includes('src/fragments')) {
            const parts = event.split('/')
            const fragmentName = parts[parts.length - 2].replace('.js', '')
            console.log(`Fragment ${fragmentName} changed compiling and deleting from require cache`)
            await compileFragment(fragmentName)
            delete require.cache[require.resolve(`${process.cwd()}/dist/${fragmentName}`)]
          }
        })

        serverCompiler.run((err, stats) => {
          if (err || stats.hasErrors()) {
            // Handle errors here
            stats.compilation.errors.forEach(error => console.log(error.message))
            console.log(`Error ${err}`)
            reject()
          } else {
            console.log('Done processing server')
            resolve()
          }
        })
      } else {
        const compiler = webpack([clientWebPackConfig, webPackConfig])
        compiler.run((err, stats) => {
          if (err || stats.hasErrors()) {
            // Handle errors here
            stats.compilation.errors.forEach(error => console.log(error.message))
            console.log(`Error ${err}`)
            reject()
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
  return `../dist/${fragmentName}`
}

module.exports = { prepare, getFragmentStream, getJsFileName, getCompiledFragmentPathname }
