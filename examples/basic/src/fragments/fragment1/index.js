const React = require('react')

const hello = () => {
  console.log('hello 1')
}

module.exports = function (props) {
  return (<div>
    <h1>Hello {props.name} from fragment 1</h1>
    <button onClick={hello}>Click me</button>
  </div>)
}
