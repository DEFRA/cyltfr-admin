const joi = require('joi')
const commentCreate = require('../models/comment-create')
const { shortId } = require('../helpers')
const capabilities = require('../models/capabilities')
const config = require('../config')
const { booleanIntersects } = require('@turf/boolean-intersects')
const { polygon } = require('@turf/helpers')


module.exports = [
  {
    method: 'GET',
    path: '/comment/create/{type}',
    handler: async (request, h) => {
      const type = request.params.type
      return h.view('comment-create', commentCreate(type, capabilities))
    },
    options: {
      validate: {
        params: joi.object().keys({
          type: joi.string().valid('holding', 'llfa').required()
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/comment/create/{type}',
    handler: async (request, _h) => {
      const provider = request.provider
      const payload = request.payload
      const type = request.params.type
      const id = shortId()
      const keyname = `${id}.json`
      const now = new Date()

      // Incoming polygon geometry
      const uploadCoordinates = request.payload.features[0].geometry.coordinates
      const uploadPolygon = polygon(uploadCoordinates)

      const comments = await provider.getFile()
      let overlapCount = 0
      const intersectingComment = []

      // Iterate through comments and get coordinates so they can be compared and find interests
      for (const element of comments) {
        const key = `${config.holdingCommentsPrefix}/${element.keyname}`
        const storedGeoJSON = await provider.getFile(key)

        const geometry = storedGeoJSON.features[0].geometry

        let storedPolygon
        if (geometry.type === 'Polygon') {
          storedPolygon = polygon(geometry.coordinates)
        } else if (geometry.type === 'MultiPolygon') {
          // Take first polygon in MultiPolygon
          // Do we need to be checking each polygon in multipolygon?
          storedPolygon = polygon(geometry.coordinates[0])
        } else {
          console.warn(`Unsupported geometry type: ${geometry.type}`)
          continue
        }

        const intersects = booleanIntersects(uploadPolygon, storedPolygon)

        if (intersects) {
          console.log(`Overlap found with: ${element.description}`)
          intersectingComment.push(element.description)
        }
      }

      try {
        // Update manifest
        await provider.addComment({
          type,
          description: payload.name,
          boundary: payload.boundary,
          featureCount: payload.features.length,
          riskType: payload.features[0]?.properties.riskType,
          createdAt: now,
          createdBy: request.auth.credentials.profile.email,
          updatedAt: now,
          updatedBy: request.auth.credentials.profile.email,
          keyname,
          id
        })

        // Upload file to s3
        await provider.uploadObject(keyname, JSON.stringify(payload))
      } catch {
        console.log('failed to upload')
      }

      // Return ok
      console.log(intersectingComment)
      return {
        intersectingComment,
        ok: true,
        id
      }
    },
    options: {
      payload: {
        maxBytes: 809715200
      },
      validate: {
        params: joi.object().keys({
          type: joi.string().valid('holding', 'llfa').required()
        }),
        payload: joi.object().keys({
          name: joi.string().required(),
          features: joi.array().required(),
          riskType: joi.string().valid('Rivers and the sea', 'Surface water')
        }).unknown(),
        failAction: async (request, h, err) => {
          console.log(err)
          const data = request.payload
          const type = request.params.type
          return h.view('comment-create', commentCreate(type, data, err)).takeover()
        }
      },
      app: {
        useErrorPages: false
      }
    }
  }]
