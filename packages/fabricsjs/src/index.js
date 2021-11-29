const { deleteFolderRecursive, requireFragmentServerJs } = require('./common')
const fabricsWebpack = require('./webpack')
const config = require('./config')
const { generateClientJs } = require('./client')
const fs = require('fs')
const { generate } = require('./sfg')
const { render } = require('./renderer')

function getFragmentNameFromRequest (req) {
  const urlParts = req.url.split('/')
  return urlParts[urlParts.length - 1].replaceAll('.js', '')
}

async function getServerSideProps (fragmentName, req) {
  const fragmentServerFile = requireFragmentServerJs(fragmentName)
  let props = {}
  if (fragmentServerFile) {
    if (fragmentServerFile.getServerSideProps) {
      props = await fragmentServerFile.getServerSideProps(req)
    } else {
      if (fragmentServerFile.getStaticProps) {
        props = fragmentServerFile.getStaticProps({})
      }
    }
  }
  return props
}

module.exports = () => {
  return {
    sfg: generate,
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
          const renderedFragment = render({ fragment, props, fragmentName, webDevMiddleWareWebpack })
          res.send(renderedFragment)
        }
      }
    },
    prepare: (server) => {
      if (config.dev) {
        deleteFolderRecursive(config.distDir)
        generateClientJs()
      }
      return fabricsWebpack.prepare(server)
    }
  }
}
