const express = require('express')
const fabricsjs = require('fabricsjs')

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = fabricsjs({ dev })
const handle = app.getRequestHandler()

const server = express()
app.prepare(server).then(() => {

  server.get('/fragments/*', handle)

  server.listen(port, err => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})
