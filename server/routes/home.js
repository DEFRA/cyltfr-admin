const homeView = require('../models/home-view')

module.exports = {
  method: 'GET',
  path: '/',
  handler: async (request, h) => {
    const { provider, auth } = request
    const comments = await provider.getFile()

    // Approvers can see all comments
    // Standard users only see their own
    const homeComments = auth.credentials.isApprover
      ? comments
      : comments.filter(c => c.createdBy === auth.credentials.profile.email)

    return h.view('home', homeView(homeComments))
  }
}
