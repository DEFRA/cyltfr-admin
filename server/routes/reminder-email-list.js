const { shortId, getApprovedUsers } = require('../helpers')

module.exports = [
  {
    method: 'GET',
    path: '/reminder-email-list',
    handler: async (request, h) => {
      const { provider, auth } = request

      const allowAccess = auth.credentials.isApprover
      if (!allowAccess) {
        return h.view('unauthorised').code(403)
      }

      const validUsers = await getApprovedUsers(provider)

      return h.view('reminder-email-list', { userList: validUsers })
    }
  },
  {
    method: 'POST',
    path: '/reminder-email-list',
    handler: async (request, h) => {
      const { provider, auth, payload } = request
      const id = shortId()

      const allowAccess = auth.credentials.isApprover
      if (!allowAccess) {
        return h.response({ message: 'Unauthorized' }).code(403)
      }

      // Server-side validation
      const { email, username } = payload

      // Validate required fields
      if (!email || !username) {
        return h.response({
          message: 'Email and username are required'
        }).code(400)
      }

      // Validate username is not empty after trimming
      if (username.trim().length === 0) {
        return h.response({
          message: 'Username cannot be empty'
        }).code(400)
      }

      // Validate email format and domain
      const emailRegex = /^[^\s@]+@(defra\.gov\.uk|environment-agency\.gov\.uk)$/i
      if (!emailRegex.test(email)) {
        return h.response({
          message: 'Email must be a valid address ending in @defra.gov.uk or @environment-agency.gov.uk'
        }).code(400)
      }

      try {
        // Upload file to s3
        payload.id = id
        await provider.uploadApproverObject(id, payload)
      } catch (error) {
        console.error('failed to upload', error)
        throw new Error('Failed to save changes')
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
        return h.response({ message: 'Unauthorized' }).code(403)
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
