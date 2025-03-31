const homeView = require('../models/home-view')

module.exports = {
  method: 'GET',
  path: '/',
  handler: async (request, h) => {
    const { provider, auth } = request
    const comments = await provider.getFile()
    const currentUser = auth.credentials.profile.email
    const notApprovedComms = comments.filter((comment) => comment.approvedAt === null)
    console.log('comments:', notApprovedComms)
    // Users can see all comments
    const homeComments = comments

    return h.view('home', homeView(homeComments, currentUser))
  }
}
