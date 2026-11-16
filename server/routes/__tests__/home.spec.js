const STATUS_CODES = require('node:http2').constants
const createServer = require('../..')
let server

const mockComments = [
  {
    id: 'comment-1',
    description: 'Test comment',
    riskType: 'River',
    type: 'holding',
    createdBy: 'test@example.com',
    featureCount: 1,
    boundary: 'Test boundary',
    approvedAt: null,
    approvedBy: null
  }
]

const authenticatedGet = () => ({
  method: 'GET',
  url: '/',
  auth: {
    credentials: { profile: { email: 'test@example.com' } },
    strategy: 'session'
  }
})

beforeAll(async () => {
  const Provider = require('../../providers/unittest')
  server = await createServer(Provider)
  await server.initialize()
})

afterAll(async () => {
  await server.stop()
})

describe('default route page', () => {
  test('redirects unauthenticated requests to login', async () => {
    const response = await server.inject({ method: 'GET', url: '/' })
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)
  })

  test('renders the home view for an authenticated user', async () => {
    jest.spyOn(server.provider, 'getFile').mockResolvedValue(mockComments)
    const response = await server.inject(authenticatedGet())
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  })

  test('renders the home view with an empty comments list', async () => {
    jest.spyOn(server.provider, 'getFile').mockResolvedValue([])
    const response = await server.inject(authenticatedGet())
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  })
})
