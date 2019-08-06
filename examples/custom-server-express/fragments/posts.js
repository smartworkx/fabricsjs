import React from 'react'

const hello = () => {
    console.log('hello')
}

export default function(props) {
   return (<div>
        <h1>My blog post</h1>
        <p>bla</p>
        <button onClick={hello}>Hello</button>
    </div>)
}
