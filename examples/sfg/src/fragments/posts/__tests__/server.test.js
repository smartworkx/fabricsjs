import server from '../server.js'

test('bla',() =>{
  expect(server.getServerSideProps().name).toEqual('joris')
})