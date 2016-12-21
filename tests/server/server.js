/**
 * Created by m.chekryshov on 21.12.16.
 */
// server.js
var jsonServer = require('json-server')
var server = jsonServer.create()
var router = jsonServer.router(require('./db.json'));
var middlewares = jsonServer.defaults()

process.title = 'json-server';

server.use(middlewares)
server.use(router)
server.listen(8887, function() {

  console.log('|------- JSON SERVER running')

  setTimeout(function() {
    console.log('\n-------> JSON SERVER successfully stopped by timeout')
    process.exit(0);
  },5000)
})
