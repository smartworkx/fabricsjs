const webpack = require('webpack')
module.exports = {
  webpack: {
    client: {
      production: {
        plugins: [
          new webpack.DllReferencePlugin({
            manifest: require('react17-dll/dist/main-manifest.json'),
          })
        ]
      }
    }
  }
}