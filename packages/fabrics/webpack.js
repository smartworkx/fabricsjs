const webpack = require('webpack')
const config = require('./config')
const {forFragments} = require('./common')

const middlewares = []

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
                        presets: ['@babel/preset-env', "@babel/preset-react"]
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

function getClientFragments() {
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
                        presets: ['@babel/preset-env', "@babel/preset-react"]
                    }
                }
            }
        ]
    }
}

// wait for both promises
const prepare = () => {
    return new Promise(async (resolve, reject) => {
            if (config.dev) {
                webPackConfig.mode = 'development'

                clientWebPackConfig.mode = 'development'
                clientWebPackConfig.plugins = [
                    new webpack.HotModuleReplacementPlugin(),
                    new webpack.NoEmitOnErrorsPlugin()
                ]
            }

            if (config.dev) {
                const compiler = await webpack(clientWebPackConfig)
                middlewares.push(require("webpack-hot-middleware")(compiler))
                middlewares.push(require("webpack-dev-middleware")(compiler,{writeToDisk:true}))

                webpack(webPackConfig,(err, stats) => {
                    if (err || stats.hasErrors()) {
                        // Handle errors here
                        stats.compilation.errors.forEach(error => console.log(error.message))
                        console.log(`Error ${err}`)
                        reject()
                    } else {
                        console.log('Done processing client')
                        resolve()
                    }
                })
            } else {
                const compiler = await webpack([clientWebPackConfig,webPackConfig])
                compiler.run((err, stats) => {
                    if (err || stats.hasErrors()) {
                        // Handle errors here
                        stats.compilation.errors.forEach(error => console.log(error.message))
                        console.log(`Error ${err}`)
                        reject()
                    } else {
                        console.log('Done processing client')
                        resolve()
                    }
                })
            }

        }
    )
}

const runHotReloadingMiddleware = async (req, res) => {
    for (const fn of middlewares) {
        await new Promise((resolve, reject) => {
            fn(req, res, err => {
                if (err) return reject(err)
                resolve()
            })
        })
    }
}

const compileFragments = async function (fragmentName) {
    return new Promise(async (resolve, reject) => {
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
                stats.compilation.errors.forEach(error => console.log(error.message))
                console.log(`Error ${err}`)
                reject()
            } else {
                console.log('Done processing client')
                resolve()
            }
        })
    })
}

module.exports = {prepare, runHotReloadingMiddleware, compileFragments}
