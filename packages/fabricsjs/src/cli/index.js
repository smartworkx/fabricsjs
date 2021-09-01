#!/usr/bin/env node

(async () => {
  const meow = require('meow')
  const build = require('./build')
  const start = require('./start')
  const dev = require('./dev')
  const doExport = require('./export')
  console.log('start')

  try {
    const cli = meow(`
	Usage
	  $ fabricsjs <input>

	Inputs:
	  build
	  dev
	  export
	  start

	Examples
	  $ fabricsjs build
`, {
      importMeta: require.meta,
    })

    const command = cli.input[0]
    if (command === 'build') {
      await build()
    } else if( command === 'start'){
      await start()
    } else if( command === 'dev'){
      await dev()
    } else if( command === 'export'){
      await doExport()
    }

  } catch (err) {
    console.error(err.message)
  } finally {
    console.log('end')
  }
})()


