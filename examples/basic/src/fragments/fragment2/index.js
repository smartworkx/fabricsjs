const React = require('react')

const hello = () => {
  console.log('hello 2')
}

module.exports = function (props) {
  return (<div>
    <h1>Hello {props.id} from fragment 2</h1>
    <button onClick={hello}>Click me</button>
  </div>)
}
