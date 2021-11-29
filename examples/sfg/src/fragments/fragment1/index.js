const React = require('react')

const hello = () => {
  console.log('hello')
}

module.exports = function (props) {
  return (<div>
    <h1>Hello {props.name}</h1>
    <button onClick={hello}>Click me!!!!</button>
  </div>)
}
