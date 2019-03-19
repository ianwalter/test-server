const http = require('http')
const Koa = require('koa')
const json = require('koa-json')
const log = require('@ianwalter/log')
const enableDestroy = require('server-destroy')

const defaultOptions = { cors: false }

module.exports = function createTestServer (options = defaultOptions) {
  // Create the Koa app instance.
  const app = new Koa()

  // Add error-handling middleware.
  app.use(async function errorHandlingMiddleware (ctx, next) {
    try {
      await next()
    } catch (err) {
      log.error(err)
      ctx.status = err.statusCode || err.status || 500
      ctx.app.emit('error', err, ctx)
    }
  })

  // Use middleware that automatically pretty-prints JSON responses.
  app.use(json())

  // If CORS is disabled, add the Access-Control-Allow-Origin header that
  // accepts all requests to the response.
  if (!options.cors) {
    app.use(async function disableCorsMiddleware (ctx, next) {
      ctx.set('Access-Control-Allow-Origin', '*')
      return next()
    })
  }

  // Create the server that will listen and execute the Koa app on all requests
  // it receives.
  const server = http.createServer(app.callback())

  // Add a destroy method to the server instance.
  // https://github.com/nodejs/node/issues/2642
  enableDestroy(server)

  // Add a close method to the Koa app to allow the caller / receiver of the Koa
  // app to close the server when done with it.
  app.close = function close () {
    return new Promise(resolve => server.destroy(resolve))
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
