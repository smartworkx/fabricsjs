const path = require('path')
const url = require('url')
const Mustache = require('mustache')
const fs = require('fs')
const promisify = require('util.promisify')

module.exports = async (
  request,
  parseTemplate
) => {
  const template = await promisify(fs.readFile)(
    `${path.join('./templates', url.parse(request.url, true).pathname)}.html`,
    'utf-8')
  const assets = require('react17-dll/dist/webpack-assets.json')
  const scripts = Object.values(assets)
  return parseTemplate(Mustache.render(template, { scripts }))
}


