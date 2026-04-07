const STATUS_CODES = require('node:http2').constants
const createServer = require('../..')
let server

beforeAll(async () => {
  try {
    const Provider = require('../../providers/unittest')
    server = await createServer(Provider)
    await server.initialize()
  } catch (error) {
    console.error('Failed to create server:', error)
    throw error
  }
})

afterAll(async () => {
  if (server) {
    await server.stop()
  }
})

describe('default route page', () => {
  test('Gets the default page', async () => {
    const options = {
      method: 'GET',
      url: '/'
    }

    const response = await server.inject(options)
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)
  })
})
