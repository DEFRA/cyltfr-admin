const STATUS_CODES = require('node:http2').constants

jest.mock('ogr2ogr', () => ({
  ogr2ogr: jest.fn()
}))

jest.unstable_mockModule('../../helpers.mjs', () => ({
  updateAndValidateGeoJson: jest.fn(),
  shortId: jest.fn(() => 'mock-id'),
  formatDate: jest.fn(),
  run: jest.fn(),
  getCommentById: jest.fn(),
  getApprovedUsers: jest.fn(() => [])
}))

jest.unstable_mockModule('../../services/polygon.mjs', () => ({
  Polygon: class MockPolygon {}
}))

jest.unstable_mockModule('../../services/intersectionService.mjs', () => ({
  findIntersectionsWithIndexedData: jest.fn()
}))

const createServer = require('../..')
let server
let ogr2ogr, updateAndValidateGeoJson, findIntersectionsWithIndexedData

const auth = {
  credentials: { profile: { email: 'test@example.com' } },
  strategy: 'session'
}

const mockGeoJson = { type: 'FeatureCollection', features: [] }
const mockIntersects = { features: [], intersects: [] }
const mockOgrData = { features: [{ type: 'Feature', geometry: { coordinates: [] }, properties: {} }] }

const boundary = 'TestFormBoundary123'
const multipartBody = Buffer.concat([
  Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="geometry"; filename="test.zip"\r\nContent-Type: application/zip\r\n\r\n`),
  Buffer.from('fake zip content'),
  Buffer.from(`\r\n--${boundary}--\r\n`)
])
const multipartRequest = {
  method: 'POST',
  url: '/shp2json/holding',
  auth,
  headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
  payload: multipartBody
}

beforeAll(async () => {
  const Provider = require('../../providers/unittest')
  server = await createServer(Provider)
  await server.initialize()
  server.methods.getIndexedShapeData = jest.fn().mockResolvedValue({});

  ({ ogr2ogr } = require('ogr2ogr'));
  ({ updateAndValidateGeoJson } = await import('../../helpers.mjs'));
  ({ findIntersectionsWithIndexedData } = await import('../../services/intersectionService.mjs'))
})

afterAll(async () => {
  await server.stop()
})

describe('POST /shp2json/{type}', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('returns geojson and intersects on success', async () => {
    ogr2ogr.mockResolvedValue({ data: mockOgrData })
    updateAndValidateGeoJson.mockResolvedValue(mockGeoJson)
    findIntersectionsWithIndexedData.mockReturnValue(mockIntersects)

    const response = await server.inject(multipartRequest)

    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_OK)
    const result = JSON.parse(response.payload)
    expect(result.geojson).toEqual(mockGeoJson)
    expect(result.intersects).toEqual(mockIntersects)
  })

  test('returns a bad request when ogr2ogr fails to process the file', async () => {
    ogr2ogr.mockRejectedValue(new Error('invalid zip'))

    const response = await server.inject(multipartRequest)

    expect(response.statusCode).toEqual(STATUS_CODES.HTTP_STATUS_BAD_REQUEST)
    const result = JSON.parse(response.payload)
    expect(result.message).toContain('Could not process uploaded file')
  })
})
