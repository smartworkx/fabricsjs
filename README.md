# Fabrics js

Fabrics js is meant to support ssr (server side rendering) and sfg (static fragment rendering) behind a server side composition
server like tailorjs. It is inspired by the nextjs framework but nextjs is more focused on complete static site generation or
complete single page applications. It works very similar create your code in the fragments source folder and fabricsjs powered
app can expose your fragments server side rendered or statically generated.

## Features
- easy server side rendering
- hot code reloading during development

## Getting started

### Prerequisites
- nvm installed

### Checkout example custom server express ssr.
- use node 16 `nvm use 16`
- run npm install in packages/fabrics-core
- go to example examples/custom-server-express-ssr
- run `npm install`
- run `npm run dev`
- create new fragments in the fragment directory

### Creating a new fragment for ssr
- Create a new directory with the name of the fragment in src/fragments
- Create an index.js which exports a React Component with module.exports
- Create a server.js which exports an object with a function called 

## Features that are explicitly out of scope
- Code splitting
- Routing
- As much as possible for now for simplicity

## Features to add/things to fix
- cache busting
- webpack customizations
- static fragment generation
- should not be necessary to use commonjs for exporting fragments
- dependencies in projects using fabrics should be kept to minimum
- cli
- npm run build  
- extendability