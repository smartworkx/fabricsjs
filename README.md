# Fabrics js

Fabrics js is meant to support ssr (server side rendering) and sfg (static fragment rendering) behind a server side composition
server like tailorjs. It is inspired by the nextjs framework but nextjs is more focused on complete static site generation or
complete single page applications. It works very similar create your code in the fragments source folder and fabricsjs powered
app can expose your fragments server side rendered or statically generated.

## Features
- easy server side rendering
- easy static generation
- hot code reloading during development
- cache busting
- webpack customizations

## Getting started

### Prerequisites
- nvm installed

### Checkout example custom server express ssr.
- use node 16 `nvm use 16`
- run `npx lerna bootstrap`
- run `cd examples/custom-server-express-ssr/ && npm i`
- run `cd examples/react17-dll/ && npm run build`
- run `cd examples/custom-server-express-ssr/ && npm run dev`
- run `cd examples/layout-service/ && npm run start`
- open in a browser http://localhost:8080/template
- create new fragments in the `examples/custom-server-express-ssr/src/fragments` directory

### Creating a new fragment for ssr
- Create a new directory with the name of the fragment in src/fragments
- Create an index.js which exports a React Component with module.exports
- Create a server.js which exports an object with a function called 

### Exending webpack config

Currently only production client side webpack config by adding a (partial) webpack config in the fabrics.config.js.
Add an object under webpack.client.production this will be merged into the webpack config with webpack merge

## Server side rendering
Fragments with a 'getServerSideProps' function will be server side rendered when the web server is ran with:
- fabricsjs build
- fabricsjs start

in production.

## Static generation
Fragments with 'getStaticPaths' and 'getStaticProps' functions will not be ran when starting the webserver, but can be exported:
- fabricsjs export \<fragment name> \<fragment instance id>

in production. In development it is easiest to open an html file directly in a browser. The generated files are in dist/client.
If you want to rerun the export every time you change the files you can do for example do that automatically 
```nodemon --exec "npm run export fragment2 --id 2" --watch src```


## Features that are explicitly out of scope
- Code splitting
- Routing
- As much as possible for now for simplicity

## Features to add/things to fix
- prove that ssr works well in a lambda
- https://nextjs.org/docs/advanced-features/preview-mode
- add cypress for testing examples
- should not be necessary to use commonjs for exporting fragments
- fabrics.config.js should be optional
- dependencies in projects using fabrics should be kept to minimum
- extendability
- cli to create new project/fragment
- koajs support?