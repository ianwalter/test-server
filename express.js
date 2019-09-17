const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const { print } = require('@ianwalter/print')
const enableDestroy = require('server-destroy')

module.exports = function createExpressServer () {
  // Create the Exoress app instance.
  const app = express()

  // Tell Express to parse requests with text content-type bodies.
  app.use(bodyParser.text())

  // Tell Express to parse requests with application/json content-type bodies.
  app.use(bodyParser.json())

  // Create the server that will listen and execute the Koa app on all requests
  // it receives.
  const server = http.createServer(app)

  // Add a destroy method to the server instance.
  // https://github.com/nodejs/node/issues/2642
  enableDestroy(server)

  // Add a close method to the Koa app to allow the caller / receiver of the Koa
  // app to close the server when done with it.
  app.close = function close () {
    return new Promise(resolve => server.destroy(resolve))
  }

  // Add error-handling middleware.
  const ise = 'Internal Server Error'
  app.useErrorMiddleware = function useErrorMiddleware () {
    app.use(function errorHandlingMiddleware (err, req, res, next) {
      print.error(err)
      res.status(err.statusCode || err.status || 500).send(err.message || ise)
    })
  }

  // Return the Koa app instance when the server has started listening.
  return new Promise((resolve, reject) => {
    server.listen(process.env.TEST_SERVER_PORT, err => {
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
