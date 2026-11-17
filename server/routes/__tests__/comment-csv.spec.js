const STATUS_CODES = require('node:http2').constants
const createServer = require('../..')

let server

const mockComment = {
  id: 'comment-1',
  description: 'Test comment',
  riskType: 'Rivers and the sea',
  type: 'holding',
  createdBy: 'test@example.com',
  keyname: 'comment-1.json',
  boundary: 'Test boundary'
}

const otherUsersComment = { ...mockComment, id: 'comment-2', createdBy: 'other@example.com' }

const mockCommentFile = {
  features: [
    {
      properties: {
        start: '2026-01-01',
        end: '2026-12-31',
        info: 'Test info',
        riskType: 'Rivers and the sea',
        riskOverrideRS: 'High',
        riskOverrideRSCC: ''
      }
    }
  ]
}

const csvRequest = (isApprover) => ({
  method: 'GET',
  url: '/comments.csv',
  auth: {
    credentials: { profile: { email: 'test@example.com' }, isApprover },
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

describe('GET /comments.csv', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  const expectCsvResponse = (response) => {
    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    expect(response.headers['content-type']).toContain('text/csv')
  }

  test('returns a CSV of all comments for an approver', async () => {
    jest.spyOn(server.provider, 'getFile')
      .mockResolvedValueOnce([mockComment])
      .mockResolvedValueOnce(mockCommentFile)

    const response = await server.inject(csvRequest(true))

    expectCsvResponse(response)
    expect(response.payload).toContain('Test comment')
  })

  test('returns only the users own comments for a non-approver', async () => {
    jest.spyOn(server.provider, 'getFile')
      .mockResolvedValueOnce([mockComment, otherUsersComment])
      .mockResolvedValueOnce(mockCommentFile)

    const response = await server.inject(csvRequest(false))

    expectCsvResponse(response)
    expect(response.payload).toContain('test@example.com')
    expect(response.payload).not.toContain('other@example.com')
  })
})
