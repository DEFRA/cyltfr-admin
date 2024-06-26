const STATUS_CODES = require('http2').constants
const createServer = require('../../../server')
let server

beforeAll(async () => {
  server = await createServer()
  await server.initialize()
})

afterAll(async () => {
  await server.stop()
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
