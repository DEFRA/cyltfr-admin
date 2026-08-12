const STATUS_CODES = require('node:http2').constants
const createServer = require('../..')
const config = require('../../config')

let server

const AUTH = {
  credentials: { profile: { email: 'test@example.com' } },
  strategy: 'session'
}

const validPayload = {
  name: 'Test comment',
  features: [{ properties: { riskType: 'Rivers and the sea' } }],
  boundary: 'Test boundary'
}

beforeAll(async () => {
  const Provider = require('../../providers/unittest')
  server = await createServer(Provider)
  await server.initialize()
})

afterAll(async () => {
  await server.stop()
})

describe('GET /comment/create/{type}', () => {
  test('renders the comment-create view', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/comment/create/holding',
      auth: AUTH
    })
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  })
})

describe('POST /comment/create/{type}', () => {
  beforeEach(() => {
    jest.spyOn(server.provider, 'addComment').mockResolvedValue(undefined)
    jest.spyOn(server.provider, 'uploadObject').mockResolvedValue(undefined)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('returns a success response with an id', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/comment/create/holding',
      auth: AUTH,
      payload: validPayload
    })

    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    const result = JSON.parse(response.payload)
    expect(result.ok).toBe(true)
    expect(result.id).toBeDefined()
    expect(result.intersectingComment).toBe('')
    expect(server.provider.addComment).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'holding',
        description: validPayload.name,
        boundary: validPayload.boundary,
        featureCount: validPayload.features.length,
        riskType: validPayload.features[0].properties.riskType,
        createdBy: AUTH.credentials.profile.email
      })
    )
    expect(server.provider.uploadObject).toHaveBeenCalled()
  })

  test('returns a success response when the provider fails', async () => {
    jest.spyOn(server.provider, 'addComment').mockRejectedValue(new Error('upload failed'))

    const response = await server.inject({
      method: 'POST',
      url: '/comment/create/holding',
      auth: AUTH,
      payload: validPayload
    })

    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    const result = JSON.parse(response.payload)
    expect(result.ok).toBe(true)
  })

  test('logs performance timing when enabled', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
    const original = config.performanceLogging
    config.performanceLogging = true

    await server.inject({
      method: 'POST',
      url: '/comment/create/holding',
      auth: AUTH,
      payload: validPayload
    })

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('POST /comment/create/'),
      expect.any(Number)
    )

    config.performanceLogging = original
  })

  test('re-renders view when payload validation fails', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/comment/create/holding',
      auth: AUTH,
      payload: { features: [] } // missing required `name`
    })

    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    expect(response.payload).toContain('Add a new comment')
  })
})
