#!/usr/bin/env node

(async () => {
  const meow = require('meow')
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
      const build = require('./build')
      await build()
    } else if( command === 'start'){
      const start = require('./start')
      await start()
    } else if( command === 'dev'){
      process.env.NODE_ENV = 'development'
      const dev = require('./dev')
      await dev()
    } else if( command === 'export'){
      const doExport = require('./export')
      await doExport({ fragmentName: cli.input[1], context: cli.flags})
    }
  } catch (err) {
    console.error(err.stack)
  } finally {
    console.log('end')
  }
})()


