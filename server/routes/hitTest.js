import joi from 'joi'
import { dataConfig } from '../config.js'
import { performance } from 'node:perf_hooks'
import { Polygon } from '../services/polygon.js'
export default {
  method: 'GET',
  path: '/hit-test',
  options: {
    description: 'Returns true if any of the risk areas intersect with the polygon',
    handler: async (request, _h) => {
      let startTime
      if (dataConfig.performanceLogging) {
        startTime = performance.now()
      }
      const query = request.query
      const polygon = query.polygon ? JSON.parse(query.polygon) : undefined
      const indexedShapeData = await request.server.methods.getIndexedShapeData()
      const intersects = indexedShapeData.polygonHitTest(new Polygon(polygon))
      if (dataConfig.performanceLogging) {
        console.log('GET /hit_test/ time: ', performance.now() - startTime)
      }
      return { intersects }
    },
    validate: {
      query: joi.object().keys({
        polygon: joi.string().required()
      }).required()
    }
  }
}
