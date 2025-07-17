const joi = require('joi')
const config = require('../../../cyltfr-admin/server/config.js')
const { performance } = require('node:perf_hooks')
const { Polygon } = require('../services/polygon.js')

module.exports = {
  method: 'GET',
  path: '/hit-test',
  handler: async (request, _h) => {
    console.log('in fetch')
    let startTime
    if (config.performanceLogging) {
      startTime = performance.now()
    }
    const query = request.query

    // checks if the query includes a polygon
    const polygon = query.polygon ? JSON.parse(query.polygon) : undefined

    // in the fmp this is a server method that checks if index shape data has been modified (checking cache for performance)
    const indexedShapeData = await request.server.methods.getIndexedShapeData()

    // uses the returned values of the shape data (which can be false) and the current polygon (changed to a polygon object with attributes) to evaluate if they 
    // intersect
    const intersects = indexedShapeData.polygonHitTest(new Polygon(polygon))
    if (config.performanceLogging) {
      console.log('GET /hit_test/ time: ', performance.now() - startTime)
    }

    // intersects is true or false
    return { intersects }
  },
  options: {
    description: 'Returns true if any of the risk areas intersect with the polygon',
    validate: {
      query: joi.object().keys({
        polygon: joi.string().required()
      }).required()
    }
  }
}
