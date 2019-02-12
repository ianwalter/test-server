const http = require('http')
const koa = require('koa')

module.exports = function createTestServer () {
  // Create the Koa app instance.
  const app = new koa()

  // Create the server that will listen and execute the Koa app on all requests
  // it receives.
  const server = http.createServer(app.callback())

  // Add a close method to the Koa app to allow the caller / receiver of the Koa
  // app to close the server when done with it.
  app.close = function close () {
    return new Promise((resolve, reject) => {
      server.close(err => {
        if (err) {
          reject(err)
        } else {
          resolve(app)
        }
      })
    })
  }

  // Return the Koa app instance when the server has started listening.
  return new Promise((resolve, reject) => {
    server.listen(err => {
      if (err) {
        reject(err)
      } else {
        // Add the server's port and URL to the app so it's easily accessible.
        app.port = server.address().port
        app.url = `http://localhost:${app.port}`

        resolve(app)
      }
    })
  })
}
