require('@babel/register')
require('core-js')
require('regenerator-runtime/runtime')
const http = require('http')
const Tailor = require('node-tailor')
const path = require('path')
const staticCache = require('koa-static-cache')
const dll = require('./dll')
const fetchTemplate = require('./template')

const tailor = new Tailor({
  fetchTemplate
})

const ASSETS_PREFIX = /^\/dist/
const requestHandler = (req, res) => {
  const { url } = req
  if (ASSETS_PREFIX.test(url)) {
    return dll(req, res)
  } else {
    try {
      tailor.requestHandler(req, res)
    } catch (e) {
      console.log(`Error in layout serve ${e.message}`)
    }
  }
}

const server = http.createServer(requestHandler)


const port = 8080
server.listen(port)
console.log('listening on port ' + port)