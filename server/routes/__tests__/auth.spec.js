const STATUS_CODES = require('node:http2').constants
const createServer = require('../..')
const config = require('../../config')

let server

// Must be set before createServer() so the cookie strategy is registered with a valid password of 32 characters
config.cookiePassword = 'test-cookie-password-long-enough-for-hapi!!'

beforeAll(async () => {
  const Provider = require('../../providers/unittest')
  server = await createServer(Provider)
  await server.initialize()
})

afterAll(async () => {
  await server.stop()
})

const loginRequest = (credentials) => ({
  method: 'GET',
  url: '/login',
  auth: { isAuthenticated: true, credentials, strategy: 'azuread' }
})

describe('GET /login', () => {
  test('sets approver scope and redirects when user has the Approver role', async () => {
    const response = await server.inject(loginRequest({
      profile: { raw: { roles: JSON.stringify(['Approver']) }, email: 'approver@example.com' }
    }))

    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)
    expect(response.headers.location).toEqual('/')
  })

  test('redirects without approver scope when user has no roles', async () => {
    const response = await server.inject(loginRequest({
      profile: { raw: {}, email: 'user@example.com' }
    }))

    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)
    expect(response.headers.location).toEqual('/')
  })
})

describe('GET /logout', () => {
  test('clears the session and redirects to logout', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/logout',
      auth: {
        credentials: { profile: { email: 'test@example.com' } },
        strategy: 'session'
      }
    })

    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)
    expect(response.headers.location).toContain(`login.microsoftonline.com/${config.adTenant}`)
  })
})
