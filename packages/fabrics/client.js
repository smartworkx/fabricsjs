const fs = require('fs')
const config = require('./config')

const { getStateName, forFragments } = require('./common')

const generateClientJsFragment = (fragmentName) => {
  const jsFileContent = `
import React from 'react'
import { hydrate } from 'react-dom'
import Fragment from '../src/fragments/${fragmentName}'

const fragmentName = '${fragmentName}'

    const rootElement = document.getElementById(fragmentName)
    let preloadedState = window['${getStateName(fragmentName)}']
    hydrate(<Fragment {...preloadedState} />, rootElement)
    if (module.hot) {
      console.log('module.hot is true')
      module.hot.accept('../src/fragments/${fragmentName}', () => {
        console.log(\`hot reloading ${fragmentName}\`)
        const ReloadedFragment = require('../src/fragments/${fragmentName}')
        preloadedState = window['${getStateName(fragmentName)}']
        hydrate(<ReloadedFragment {...preloadedState} />, rootElement)
      })
    }`
  const distDir = config.distDir
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir)
  }
  fs.writeFileSync(`${distDir}/${fragmentName}-client.js`, jsFileContent)
}

const generateClientJs = () => {
  forFragments((fragmentName) => {
    generateClientJsFragment(fragmentName)
  })
}

module.exports = {
  generateClientJs
}
