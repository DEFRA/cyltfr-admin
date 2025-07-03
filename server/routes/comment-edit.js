const joi = require('joi')
const boom = require('@hapi/boom')
const config = require('../config')
const commentView = require('../models/comment-view')
const commentEdit = require('../models/comment-edit')
const capabilities = require('../models/capabilities')

const handleCommentDelete = async (request, h) => {
  const { params, auth } = request
  const { id } = params
  const provider = request.provider
  const comments = await provider.getFile()
  const comment = comments.find(c => c.id === id)

  // Only approvers or comment authors can delete
  const allowDelete = auth.credentials.isApprover ||
  comment.createdBy === auth.credentials.profile.email

  if (!allowDelete) {
    return boom.badRequest('You cannot delete this comment')
  }

  // Delete the comment
  const idx = comments.indexOf(comment)
  comments.splice(idx, 1)

  await provider.deleteFile(comment.keyname)
  await provider.save(comments)

  return h.redirect('/')
}

module.exports = [
  {
    method: 'GET',
    path: '/comment/view/{id}',
    handler: async (request, h) => {
      const { params } = request
      const { id } = params
      const provider = request.provider
      const comments = await provider.getFile()
      const comment = comments.find(c => c.id === id)
      const key = `${config.holdingCommentsPrefix}/${comment.keyname}`
      const geometry = await provider.getFile(key)

      return h.view('comment-view', commentView(comment, geometry, request.auth, capabilities))
    },
    options: {
      validate: {
        params: joi.object().keys({
          id: joi.string().required()
        })
      }
    }
  },
  {
    method: 'GET',
    path: '/comment/edit/{id}',
    handler: async (request, h) => {
      const { params } = request
      const { id } = params
      const provider = request.provider
      const comments = await provider.getFile()
      const comment = comments.find(c => c.id === id)
      const key = `${config.holdingCommentsPrefix}/${comment.keyname}`
      const geometry = await provider.getFile(key)
      const features = geometry.features
      const type = comment.type
      const riskType = []
      const selectedRadio = []
      const textCommentRadio = []

      features.forEach(function (feature) {
        if (type === 'holding') {
          selectedRadio.push(feature.properties.riskOverride)
          textCommentRadio.push(feature.properties.commentText)
        } else {
          selectedRadio.push(feature.properties.info)
        }

        riskType.push(feature.properties.riskType)
      })

      const commentData = {
        comment,
        geometry,
        capabilities,
        features,
        id,
        type,
        riskType,
        selectedRadio,
        textCommentRadio
      }

      const authData = {
        isApprover: request.auth.credentials.isApprover,
        profile: request.auth.credentials.profile
      }

      return h.view(
        'comment-edit', commentEdit(commentData, authData))
    },
    options: {
      validate: {
        params: joi.object().keys({
          id: joi.string().required()
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/comment/edit/{id}',
    handler: async (request, h) => {
      const { payload, params, auth } = request
      const { id } = params
      const provider = request.provider
      const comments = await provider.getFile()
      const comment = comments.find(c => c.id === id)
      const key = `${config.holdingCommentsPrefix}/${comment.keyname}`
      const geometry = await provider.getFile(key)
      const features = geometry.features
      const formattedPayload = geometry
      const type = comment.type

      // Update the comment
      Object.assign(comment, {
        description: payload.name,
        boundary: payload.boundary,
        updatedAt: new Date(),
        approvedAt: null,
        approvedBy: null,
        updatedBy: auth.credentials.profile.email
      })

      formattedPayload.name = payload.name
      formattedPayload.name = payload.boundary

      features.forEach(function (_feature, index) {
        if (type === 'llfa') {
          formattedPayload.features[index].properties.info = payload[`features_${index}_properties_report_type`]
        } else {
          formattedPayload.features[index].properties.info = payload[`features_${index}_properties_info`]
          formattedPayload.features[index].properties.riskOverride = payload[`override_${index}-risk`]
          formattedPayload.features[index].properties.riskType = payload[`sw_or_rs_${index}`]
          if (payload[`add_holding_comment_${index}`] === 'No') {
            formattedPayload.features[index].properties.commentText = payload[`add_holding_comment_${index}`]
            formattedPayload.features[index].properties.info = ''
          } else {
            formattedPayload.features[index].properties.commentText = payload[`add_holding_comment_${index}`]
          }
        }
        formattedPayload.features[index].properties.start = payload[`features_${index}_properties_start`]
        formattedPayload.features[index].properties.end = payload[`features_${index}_properties_end`]
      })

      // Upload file to s3
      await provider.uploadObject(`${comment.keyname}`, JSON.stringify(formattedPayload))

      // Updates risk type in table after saving edit
      comment.riskType = features[0]?.properties.riskType

      await provider.save(comments)

      return h.redirect('/')
    },
    options: {
      validate: {
        params: joi.object().keys({
          id: joi.string().required()
        }),
        failAction: async (_request, h, err) => {
          console.log(err)
          return h.view('/comment/create')
        }
      },
      app: {
        useErrorPages: false
      }
    }
  },
  {
    method: 'POST',
    path: '/comment/edit/{id}/approve',
    handler: async (request, h) => {
      const { params, auth } = request
      const { id } = params
      const provider = request.provider
      const comments = await provider.getFile()
      const comment = comments.find(c => c.id === id)

      // Approve
      comment.approvedAt = new Date()
      comment.approvedBy = auth.credentials.profile.email

      await provider.save(comments)

      return h.redirect('/')
    },
    options: {
      auth: {
        mode: 'required',
        scope: '+approve:comments'
      },
      validate: {
        params: joi.object().keys({
          id: joi.string().required()
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/comment/edit/{id}/undo-approve',
    handler: async (request, h) => {
      const { params } = request
      const { id } = params
      const provider = request.provider
      const comments = await provider.getFile()
      const comment = comments.find(c => c.id === id)

      // Undo approve
      comment.approvedAt = null
      comment.approvedBy = null

      await provider.save(comments)

      return h.redirect('/')
    },
    options: {
      auth: {
        mode: 'required',
        scope: '+approve:comments'
      },
      validate: {
        params: joi.object().keys({
          id: joi.string().required()
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/comment/edit/{id}/delete',
    handler: async (request, h) => {
      return handleCommentDelete(request, h)
    },
    options: {
      validate: {
        params: joi.object().keys({
          id: joi.string().required()
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/comment/edit/{id}/deletesingle/{index}',
    handler: async (request, h) => {
      const { params, auth } = request
      const { id } = params
      const provider = request.provider
      const comments = await provider.getFile()
      const comment = comments.find(c => c.id === id)
      const key = `${config.holdingCommentsPrefix}/${comment.keyname}`
      const geometry = await provider.getFile(key)
      const features = geometry.features

      // Only approvers or comment authors can delete
      const allowDelete = auth.credentials.isApprover ||
      comment.createdBy === auth.credentials.profile.email

      if (!allowDelete) {
        return boom.badRequest('You cannot delete this comment')
      }

      features.splice(params.index, 1)
      if (features.length === 0) {
        return handleCommentDelete(request, h)
      }

      comment.riskType = features[0]?.properties.riskType

      // Update the comment
      Object.assign(comment, {
        updatedAt: new Date(),
        approvedAt: null,
        approvedBy: null,
        updatedBy: auth.credentials.profile.email,
        featureCount: features.length
      })

      // Upload file to s3
      await provider.uploadObject(`${comment.keyname}`, JSON.stringify(geometry))

      await provider.save(comments)

      return h.redirect(`/comment/view/${id}`)
    },
    options: {
      validate: {
        params: joi.object().keys({
          id: joi.string().required(),
          index: joi.number().required()
        })
      }
    }

  }
]
