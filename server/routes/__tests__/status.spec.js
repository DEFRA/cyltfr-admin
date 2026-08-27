const STATUS_CODES = require('node:http2').constants
const createServer = require('../..')

let server

beforeAll(async () => {
  const Provider = require('../../providers/unittest')
  server = await createServer(Provider)
  await server.initialize()
})

afterAll(async () => {
  await server.stop()
})

describe('GET /status', () => {
  test('returns ok', async () => {
    const response = await server.inject({ method: 'GET', url: '/status' })

    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    expect(response.payload).toEqual('ok')
  })
})
