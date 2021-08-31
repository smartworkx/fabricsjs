const React = require('react')
const reactServer = require('react-dom/server')
const { getStateName, deleteFolderRecursive } = require('./common')
const fabricsWebpack = require('./webpack')
const config = require('./config')
const { generateClientJs } = require('./client')
const fs = require('fs')

const renderFragment = (html, preloadedState, fragmentName, jsFileName) => {
  return `<html>
      <body>
        <div id="${fragmentName}">${html}</div>
        <script>
          window.${getStateName(fragmentName)} = ${JSON.stringify(preloadedState).replace(/</g, '\\x3c')}
        </script>
        <script src="${config.assetHost}/${config.assetPrefix}/${jsFileName}"></script>
      </body>
     <html>`
}

function getFragmentNameFromRequest (req) {
  const urlParts = req.url.split('/')
  return urlParts[urlParts.length - 1].replaceAll('.js', '')
}

async function getServerSideProps (fragmentName, req) {
  const fragmentServerFile = require.main.require(`./fragments/${fragmentName}/server`)
  let props = {}
  if (fragmentServerFile) {
    if (fragmentServerFile.getServerSideProps) {
      props = await fragmentServerFile.getServerSideProps(req)
    }
  }
  return props
}

function getJsFileName (webDevMiddleWareWebpack, fragmentName) {
  if (webDevMiddleWareWebpack) {
    return fabricsWebpack.getJsFileName(webDevMiddleWareWebpack, fragmentName)
  } else {
    return fabricsWebpack.getAssetConfig(fragmentName).js.replaceAll('/', '')
  }
}

module.exports = () => {
  return {
    getRequestHandler: () => async (req, res) => {
      console.log(`fabrics handling request ${req.url}`)
      const webDevMiddleWareWebpack = res.locals.webpack
      if (req.url.match(config.assetPrefix)) {
        let readStream
        if (webDevMiddleWareWebpack) {
          const fragmentName = getFragmentNameFromRequest(req)
          readStream = fabricsWebpack.getFragmentStream(webDevMiddleWareWebpack, fragmentName)
        } else {
          const urlParts = req.url.split('/')
          const jsFileName = urlParts[urlParts.length - 1]
          readStream = fs.createReadStream(config.distDir + '/client/' + jsFileName)
        }
        readStream.pipe(res)
      } else {
        if (req.url.match('fragments')) {
          const fragmentName = getFragmentNameFromRequest(req)
          let fragment
          try {
            fragment = require(fabricsWebpack.getCompiledFragmentPathname(fragmentName))
          } catch (e) {
            console.log(`No fragment found for ${fragmentName} ${e.message}`)
            res.send(`No fragment found for ${fragmentName}`)
            return
          }
          const props = await getServerSideProps(fragmentName, req)
          const html = reactServer.renderToString(React.createElement(fragment, props))
          const jsFileName = getJsFileName(webDevMiddleWareWebpack, fragmentName)
          res.send(renderFragment(html, props, fragmentName, jsFileName))
        }
      }
    },
    prepare: (server) => {
      deleteFolderRecursive(config.distDir)
      generateClientJs()
      return fabricsWebpack.prepare(server)
    }
  }
}
