const STATUS_CODES = require('node:http2').constants
const createServer = require('../..')

let server

const auth = {
  credentials: { profile: { email: 'test@example.com' } },
  strategy: 'session'
}

beforeAll(async () => {
  const Provider = require('../../providers/unittest')
  server = await createServer(Provider)
  await server.initialize()
})

afterAll(async () => {
  await server.stop()
})

describe('GET /comment/file/{key}', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('returns the file body on success', async () => {
    jest.spyOn(server.provider, 'getFile').mockResolvedValue({ Body: 'file content' })

    const response = await server.inject({
      method: 'GET',
      url: '/comment/file/test-key',
      auth
    })

    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    expect(response.payload).toEqual('file content')
  })

  test('returns a 404 page when the file is not found', async () => {
    jest.spyOn(server.provider, 'getFile').mockRejectedValue(new Error('not found'))

    const response = await server.inject({
      method: 'GET',
      url: '/comment/file/test-key',
      auth
    })

    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    expect(response.payload).toContain('Page not found')
  })
})
