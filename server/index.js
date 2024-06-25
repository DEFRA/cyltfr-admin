const hapi = require('@hapi/hapi')
const schedule = require('node-schedule')
const config = require('./config')
const { processManifest } = require('./services')

async function createServer () {
  // Create the hapi server
  const server = hapi.server({
    port: config.port,
    routes: {
      auth: {
        mode: 'required'
      },
      validate: {
        options: {
          abortEarly: false
        }
      }
    }
  })

  // Register the auth plugins
  await server.register(require('@hapi/bell'))
  await server.register(require('@hapi/cookie'))

  // Setup the authentication strategies
  server.auth.strategy('azuread', 'bell', {
    provider: 'azure-legacy',
    password: config.cookiePassword,
    clientId: config.adClientId,
    clientSecret: config.adClientSecret,
    isSecure: config.isSecure,
    forceHttps: config.forceHttps,
    config: {
      tenant: config.adTenant
    }
  })

  server.auth.strategy('session', 'cookie', {
    cookie: {
      password: config.cookiePassword,
      isSecure: config.isSecure
    },
    redirectTo: '/login'
  })

  server.auth.default('session')

  // Register the remaining plugins
  await server.register(require('@hapi/inert'))
  await server.register(require('./plugins/views'))
  await server.register(require('./plugins/router'))
  await server.register(require('./plugins/error-pages'))
  await server.register({
    plugin: require('./plugins/provider'),
    options: {
      Provider: require('./providers/s3')
    }
  })
  await server.register(require('./plugins/logging'))
  await server.register(require('blipp'))

  server.ext('onPostHandler', (request, h) => {
    const response = request.response
    if (response.variety === 'view') {
      const ctx = response.source.context || {}
      const meta = ctx.meta || {}

      // Set the auth object
      // onto the top level context
      ctx.auth = request.auth

      // Set some common context
      // variables under the `meta` namespace
      meta.url = request.url.href
      meta.timestamp = new Date()

      ctx.meta = meta
      response.source.context = ctx
    }
    return h.continue
  })

  schedule.scheduleJob('0 * * * *', async () => {
    const output = []

    const result = await processManifest(server.provider, (...args) => {
      output.push(args)
    })

    server.log(['load'], { result, output })
  })

  return server
}

module.exports = createServer
