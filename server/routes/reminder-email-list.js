const joi = require('joi')
const commentCreate = require('../models/comment-create')
const { shortId } = require('../helpers')
const capabilities = require('../models/capabilities')

module.exports = [
  {
    method: 'GET',
    path: '/reminder-email-list',
    handler: async (request, h) => {
      const { provider, auth } = request
      const bucketContents = await provider.listBucketContents()
      const userList = await Promise.all(
        bucketContents
          .map(async (item) => {
            const itemId = item.Key.split('/').pop()
            if (!itemId) {
              console.log('no itemId: ', item)
              return null // Skip this item if no ID
            }
    
            try {
              const getApprovedUsers = await provider.getApprovedUsers(itemId)
              return getApprovedUsers
            } catch (error) {
              console.error(`Error fetching user data for ${itemId}:`, error)
              return null
            }
          })
      )
    
      // Remove any null entries
      const filteredUserList = userList.filter(Boolean)
      
      const allowAccess = auth.credentials.isApprover
      if (!allowAccess) {
        return h.view('unauthorised')
      }

      return h.view('reminder-email-list', { filteredUserList })
    }
  },
  {
    method: 'POST',
    path: '/reminder-email-list',
    handler: async (request, h) => {
      const provider = request.provider
      const payload = request.payload
      const id = shortId()
      const keyname = `${id}.json`

      try {
        // Upload file to s3
        payload.id = id
        await provider.uploadApproverObject(keyname, JSON.stringify(payload))
      } catch {
        console.log('failed to upload')
      }

      // Return ok
      return h.redirect('reminder-email-list')
    },
  },
  {
      method: 'POST',
      path: '/reminder-email-list/delete/{id}',
      handler: async (request, h) => {
        const { provider, auth } = request
        const { id } = request.params
  
        // Check if user has permission to delete
        const allowAccess = auth.credentials.isApprover
        if (!allowAccess) {
          return h.response({ message: 'Unauthorized' }).code(401)
        }
  
        try {
          // Delete the approver file from S3
          await provider.deleteApproverObject(`${id}.json`)
          
          return h.view('reminder-email-list')
        } catch (error) {
          console.error('Error deleting approver:', error)
          return h.response({ message: 'Failed to delete approver' }).code(500)
        }
      }
    }
  
]