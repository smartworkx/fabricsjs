const url = require('url')
const path = require('path')
const fs = require('fs')

const mimeType = {
  '.ico': 'image/x-icon',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff': 'aplication/font-woff',
  '.woff2': 'aplication/font-woff2'
}

/**
 * Middleware that streams requested asset file.
 */
module.exports = (req, res) => {
  const pathname = url.parse(req.url).pathname
  const { ext } = path.parse(pathname)
  let dllName = 'react17-dll'
  const stream = fs.createReadStream(__dirname + '/node_modules/' + dllName + pathname)
    .on('open', () => {
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Content-type', mimeType[ext] || 'text/plain')
      res.setHeader('Cache-Control', 'max-age=31536000')
      stream.pipe(res)
    })
    .on('error', (err) => {
      res.statusCode = 404
      res.end(err.message)
    })
}
