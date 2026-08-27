const STATUS_CODES = require('node:http2').constants
const createServer = require('../..')

let server

const approverAuth = {
  credentials: { profile: { email: 'approver@defra.gov.uk' }, isApprover: true },
  strategy: 'session'
}

const nonApproverAuth = {
  credentials: { profile: { email: 'user@example.com' }, isApprover: false },
  strategy: 'session'
}

const validPayload = { email: 'test@defra.gov.uk', username: 'Test User' }

const getRequest = (auth) => ({ method: 'GET', url: '/reminder-email-list', auth })
const postRequest = (payload, auth = approverAuth) => ({ method: 'POST', url: '/reminder-email-list', auth, payload })
const deleteRequest = (auth = approverAuth) => ({ method: 'POST', url: '/reminder-email-list/delete/some-id', auth })

beforeAll(async () => {
  const Provider = require('../../providers/unittest')
  server = await createServer(Provider)
  await server.initialize()
})

afterAll(async () => {
  await server.stop()
})

describe('GET /reminder-email-list', () => {
  test('returns 403 for a non-approver', async () => {
    const response = await server.inject(getRequest(nonApproverAuth))
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FORBIDDEN)
  })

  test('renders the email list for an approver', async () => {
    const response = await server.inject(getRequest(approverAuth))
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
  })
})

describe('POST /reminder-email-list', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('returns 403 for a non-approver', async () => {
    const response = await server.inject(postRequest(validPayload, nonApproverAuth))
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FORBIDDEN)
  })

  test('returns 400 when email is missing', async () => {
    const response = await server.inject(postRequest({ username: 'Test User' }))
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_BAD_REQUEST)
  })

  test('returns 400 when username is missing', async () => {
    const response = await server.inject(postRequest({ email: 'test@defra.gov.uk' }))
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_BAD_REQUEST)
  })

  test('returns 400 when username is whitespace only', async () => {
    const response = await server.inject(postRequest({ email: 'test@defra.gov.uk', username: '   ' }))
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_BAD_REQUEST)
  })

  test('returns 400 when email domain is invalid', async () => {
    const response = await server.inject(postRequest({ email: 'test@gmail.com', username: 'Test User' }))
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_BAD_REQUEST)
  })

  test('redirects to the email list on a successful upload', async () => {
    jest.spyOn(server.provider, 'uploadApproverObject').mockResolvedValue(undefined)

    const response = await server.inject(postRequest(validPayload))
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)
    expect(response.headers.location).toEqual('/reminder-email-list')
  })

  test('returns an error page when the upload fails', async () => {
    jest.spyOn(server.provider, 'uploadApproverObject').mockRejectedValue(new Error('S3 error'))
    jest.spyOn(console, 'error').mockImplementation(() => {})

    const response = await server.inject(postRequest(validPayload))
    // error-pages plugin intercepts the thrown error and renders the 500 view as 200
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    expect(response.payload).toContain('Sorry, there is a problem with the service')
  })
})

describe('POST /reminder-email-list/delete/{id}', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('returns 403 for a non-approver', async () => {
    const response = await server.inject(deleteRequest(nonApproverAuth))
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FORBIDDEN)
  })

  test('redirects to the email list after a successful delete', async () => {
    jest.spyOn(server.provider, 'deleteApproverObject').mockResolvedValue(undefined)

    const response = await server.inject(deleteRequest())
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_FOUND)
    expect(response.headers.location).toEqual('/reminder-email-list')
  })

  test('returns 500 when the delete fails', async () => {
    jest.spyOn(server.provider, 'deleteApproverObject').mockRejectedValue(new Error('S3 error'))
    jest.spyOn(console, 'error').mockImplementation(() => {})

    const response = await server.inject(deleteRequest())
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_INTERNAL_SERVER_ERROR)
    expect(JSON.parse(response.payload).message).toEqual('Failed to delete approver')
  })
})
