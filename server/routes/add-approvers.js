const joi = require('joi')
const commentCreate = require('../models/comment-create')
const { shortId } = require('../helpers')
const capabilities = require('../models/capabilities')

module.exports = [
  {
    method: 'GET',
    path: '/add-approvers',
    handler: async (request, h) => {
      const { provider, auth } = request
      const comments = await provider.getFile()
      const currentUser = auth.credentials.profile.email
      const success = request.query.success ? 'User added successfully!' : null;
      
      const allowAccess = auth.credentials.isApprover
      if (!allowAccess) {
        return h.view('unauthorised')
      }

      return h.view('add-approvers', { success })
    }
  },
  {
    method: 'POST',
    path: '/add-approvers',
    handler: async (request, h) => {
      const provider = request.provider
      const payload = request.payload
      const type = request.params.type
      const id = shortId()
      const keyname = `${id}.json`
      const now = new Date()

      try {
        await provider.addApprover({
          name: payload.username,
          email: payload.email,
          approver: true,
          id
        })

        // Upload file to s3
        await provider.uploadApproverObject(keyname, JSON.stringify(payload))
      } catch {
        console.log('failed to upload')
      }

      // Return ok
      return h.redirect('add-approvers?success=true')
    }
  }]