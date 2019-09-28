const http = require('http')
const Koa = require('koa')
const json = require('koa-json')
const { Print } = require('@ianwalter/print')
const enableDestroy = require('server-destroy')
const bodyParser = require('koa-bodyparser')
const compress = require('koa-compress')

const defaultOptions = { cors: false }

module.exports = function createKoaServer (options = defaultOptions) {
  // Create the print logger instance.
  const print = new Print({ level: options.logLevel || 'info' })

  // Create the Koa app instance.
  const app = new Koa()

  // Add error-handling middleware.
  app.use(async function errorHandlingMiddleware (ctx, next) {
    try {
      await next()
    } catch (err) {
      print.error(err)
      ctx.status = err.statusCode || err.status || 500
      ctx.body = err.message || 'Internal Server Error'
      ctx.app.emit('error', err, ctx)
    }
  })

  // Add the bodyparser middleware that can parse a request body into json, etc.
  app.use(bodyParser({ enableTypes: ['json', 'form', 'text'] }))

  // Use middleware that automatically pretty-prints JSON responses.
  app.use(json())

  //
  app.use(compress())

  // If CORS is disabled, add the Access-Control-Allow-Origin header that
  // accepts all requests to the response.
  if (!options.cors) {
    app.use(async function disableCorsMiddleware (ctx, next) {
      ctx.set('Access-Control-Allow-Origin', '*')
      ctx.set('Access-Control-Allow-Headers', '*')
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
    server.listen(options.port, err => {
      if (err) {
        reject(err)
      } else {
        // Add the server's port and URL to the app so it's easily accessible.
        app.port = server.address().port
        app.url = `http://localhost:${app.port}`

        print.debug('App listening', app)

        resolve(app)
      }
    })
  })
}
