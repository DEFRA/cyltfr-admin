const { shortId } = require('../helpers')

module.exports = [
  {
    method: 'GET',
    path: '/reminder-email-list',
    handler: async (request, h) => {
      const { provider, auth } = request

      const allowAccess = auth.credentials.isApprover
      if (!allowAccess) {
        return h.view('unauthorised')
      }

      const emailIds = await provider.listEmailIds()
      const userList = await Promise.all(
        emailIds
          .map(async (itemId) => {
            try {
              const approvedUser = await provider.getApprovedUser(itemId)
              return approvedUser // Return the data
            } catch (error) {
              console.error(`Error fetching user data for ${itemId}:`, error)
              return null
            }
          })
      )

      return h.view('reminder-email-list', { userList })
    }
  },
  {
    method: 'POST',
    path: '/reminder-email-list',
    handler: async (request, h) => {
      const provider = request.provider
      const payload = request.payload
      const id = shortId()

      try {
        // Upload file to s3
        payload.id = id
        await provider.uploadApproverObject(id, payload)
      } catch {
        console.log('failed to upload')
      }

      // Return ok
      return h.redirect('/reminder-email-list')
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
        await provider.deleteApproverObject(id)

        // Return ok
        return h.redirect('/reminder-email-list')
      } catch (error) {
        console.error('Error deleting approver:', error)
        return h.response({ message: 'Failed to delete approver' }).code(500)
      }
    }
  }

]
