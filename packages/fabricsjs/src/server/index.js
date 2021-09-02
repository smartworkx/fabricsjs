const express = require('express')
const fabricsjs = require('../index')

const port = parseInt(process.env.PORT, 10) || 3000
const app = fabricsjs()
const fabricsRequestHandler = app.getRequestHandler()

const server = express()
app.prepare(server).then(() => {

  server.get('*',fabricsRequestHandler)

  server.listen(port, err => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})
