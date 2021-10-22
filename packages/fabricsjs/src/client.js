const { writeGeneratedClientFile } = require('./filestructure')

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
  writeGeneratedClientFile(fragmentName, jsFileContent)
}

const generateClientJs = () => {
  forFragments((fragmentName) => {
    generateClientJsFragment(fragmentName)
  })
}

module.exports = {
  generateClientJs,
  generateClientJsFragment
}
