const fabricsWebpack = require('../webpack')
const fs = require('fs')
const { getClientDistDir } = require('../filestructure')
const { render } = require('../renderer')
const { requireFragmentServerJs, getFragmentNames } = require('../common')
const { generateClientJsFragment } = require('../client')

const exportFragment = async (fragmentName, context) => {
  const fragment = require(fabricsWebpack.getCompiledFragmentPathname(fragmentName))
  const fragmentServerJs = requireFragmentServerJs(fragmentName)
  const getStaticPathsReturnValue = await fragmentServerJs.getStaticPaths(context)
  const paths = getStaticPathsReturnValue.paths
  for (const path of paths) {
    const staticProps = await fragmentServerJs.getStaticProps(path)
    const postfix = fragmentServerJs.getStaticPathPostfix ? `-${fragmentServerJs.getStaticPathPostfix(path)}` : ''
    fs.writeFileSync(`${getClientDistDir()}/${fragmentName}${postfix}.html`, render({
      fragment,
      props: staticProps.props,
      fragmentName,
      assetPrefix: '.'
    }))
  }
}

module.exports = async ({ fragmentName, context }) => {
  console.log(`Exporting ${fragmentName}`)
  generateClientJsFragment(fragmentName)
  await fabricsWebpack.build(fragmentName)
  if (fragmentName) {
    await exportFragment(fragmentName, context)
  } else {
    const fragmentNames = await getFragmentNames()
    for (const fragmentName of fragmentNames) {
      await exportFragment(fragmentName)
    }
  }
}
