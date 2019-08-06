const React = require('react')
const reactServer = require('react-dom/server')
const {getStateName, deleteFolderRecursive} = require('./common')
const fabricsWebpack = require('./webpack')
const config = require('./config')
const {generateClientJs} = require('./client')
const path = require('path')
const fs = require('fs')

const distPath = path.join(process.cwd(), './dist')

const renderFragment = (html, preloadedState, fragmentName, assetPrefix, jsFileName) => {
    return `<html>
      <body>
        <div id="${fragmentName}">${html}</div>
        <script>
          window.${getStateName(fragmentName)} = ${JSON.stringify(preloadedState).replace(/</g, '\\x3c')}
        </script>
        <script src="${assetPrefix}/${jsFileName}"></script>
      </body>
     <html>`
}

module.exports = () => {
    return {
        getRequestHandler: () => async (req, res) => {
            const fragmentName = 'posts'
            if (config.dev) {
                console.log(`req path ${req.path}`)
                if (req.path.match('__webpack_hmr') || req.path.match('hot-update')) {
                    await fabricsWebpack.runHotReloadingMiddleware(req, res)
                    return
                } else {
                    await fabricsWebpack.compileFragments(fragmentName)
                }
            }
            const fragment = require.main.require(`./dist/${fragmentName}`).default
            const props = {}

            if (req.path.match(config.assetPrefix)) {
                const readStream = fs.createReadStream(distPath + '/client/' + fragmentName + '.js')
                readStream.pipe(res);
            } else {
                if (fragment) {
                    const html = reactServer.renderToString(React.createElement(fragment, props))
                    res.send(renderFragment(html, {id: 'bla'}, fragmentName, config.assetPrefix, `${fragmentName}-client.js`))
                } else {
                    res.send(`No fragment found for ${fragmentName}`)
                }
            }
        },
        prepare: () => {
            deleteFolderRecursive(config.distDir)
            generateClientJs()
            return fabricsWebpack.prepare()
        }
    }
}
