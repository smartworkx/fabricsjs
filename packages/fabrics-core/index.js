const React = require('react')
const reactServer = require('react-dom/server')
const { getStateName, deleteFolderRecursive } = require('./common')
const fabricsWebpack = require('./webpack')
const config = require('./config')
const { generateClientJs } = require('./client')
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
      const fragment = require.main.require(fabricsWebpack.getCompiledFragmentPathname(fragmentName))
      const fragmentServerFile = require.main.require(`./fragments/${fragmentName}/server`)
      let props = {}
      if (fragmentServerFile) {
        if (fragmentServerFile.getServerSideProps) {
          props = await fragmentServerFile.getServerSideProps(req)
        }
      }
      const webDevMiddleWareWebpack = res.locals.webpack

      if (req.path.match(config.assetPrefix)) {
        let readStream
        if (webDevMiddleWareWebpack) {
          readStream = fabricsWebpack.getFragmentStream(webDevMiddleWareWebpack, fragmentName)
        } else {
          readStream = fs.createReadStream(distPath + '/client/' + fragmentName + '.js')
        }
        readStream.pipe(res)
      } else {
        if (fragment) {
          const html = reactServer.renderToString(React.createElement(fragment, props))

          let jsFileName = `${fragmentName}-client.js`
          if (webDevMiddleWareWebpack) {
            jsFileName = fabricsWebpack.getJsFileName(webDevMiddleWareWebpack, fragmentName)
          }
          res.send(renderFragment(html, props, fragmentName, config.assetPrefix, jsFileName))
        } else {
          res.send(`No fragment found for ${fragmentName}`)
        }
      }
    }
    ,
    prepare: (server) => {
      deleteFolderRecursive(config.distDir)
      generateClientJs()
      return fabricsWebpack.prepare(server)
    }
  }
}
