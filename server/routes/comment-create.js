const joi = require('joi')
const commentCreate = require('../models/comment-create')
const capabilities = require('../models/capabilities')
const config = require('../config')
const { performance } = require('node:perf_hooks')

module.exports = [
  {
    method: 'GET',
    path: '/comment/create/{type}',
    handler: async (request, h) => {
      const type = request.params.type
      const viewData = commentCreate(type, capabilities)
      viewData.crumb = request.plugins.crumb
      return h.view('comment-create', viewData)
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
    options: {
      plugins: {
        crumb: {
          restful: false
        }
      },
      payload: {
        maxBytes: 809715200
      },
      validate: {
        params: joi.object().keys({
          type: joi.string().valid('holding', 'llfa').required()
        }),
        payload: joi.object().keys({
          jsonFileData: joi.object({
            name: joi.string().required(),
            features: joi.array().required(),
            riskType: joi.string().valid('Rivers and the sea', 'Surface water'),
            type: joi.any().optional(),
            crs: joi.any().optional(),
            boundary: joi.any().optional()
          }),
          crumb: joi.string().optional()
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
    },
    handler: async (request, _h) => {
      let startTime
      if (config.performanceLogging) {
        startTime = performance.now()
      }
      const { shortId } = await import('../helpers.mjs')
      const provider = request.provider
      const payload = request.payload.jsonFileData
      const type = request.params.type
      // TODO: This code should check that the newly created id doesn't already exist.
      const id = shortId()
      const keyname = `${id}.json`
      const now = new Date()

      const intersectingComment = ''

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

      if (config.performanceLogging) {
        console.log('POST /comment/create/ time: ', performance.now() - startTime)
      }
      return {
        intersectingComment,
        ok: true,
        id
      }
    }
  }]
