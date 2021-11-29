const React = require('react')
const reactServer = require('react-dom/server')
const fabricsWebpack = require('./webpack')
const { getStateName } = require('./common')
const config = require('./config')

const renderFragment = (html, preloadedState, fragmentName, jsFileName, assetPrefixParam) => {
  const assetPrefix = assetPrefixParam || `${config.assetHost}/${config.assetPrefix}`
  return `<div id="${fragmentName}">${html}</div>
        <script>
          window.${getStateName(fragmentName)} = ${JSON.stringify(preloadedState).replace(/</g, '\\x3c')}
        </script>
        <script async src="${assetPrefix}/${jsFileName}"></script>`
}

const getJsFileName = (webDevMiddleWareWebpack, fragmentName) => {
  if (webDevMiddleWareWebpack) {
    return fabricsWebpack.getJsFileName(webDevMiddleWareWebpack, fragmentName)
  } else {
    return fabricsWebpack.getAssetConfig(fragmentName).js.replaceAll('/', '')
  }
}

const render = ({ fragment, props, fragmentName, webDevMiddleWareWebpack, assetPrefix }) => {
  const html = reactServer.renderToString(React.createElement(fragment, props))
  const jsFileName = getJsFileName(webDevMiddleWareWebpack, fragmentName)
  return renderFragment(html, props, fragmentName, jsFileName, assetPrefix)
}

module.exports = {
  render
}
