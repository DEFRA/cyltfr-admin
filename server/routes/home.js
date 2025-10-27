const homeView = require('../models/home-view')

module.exports = {
  method: 'GET',
  path: '/',
  handler: async (request, h) => {
    const { provider, auth } = request
    const comments = await provider.getFile()
    const currentUser = auth.credentials.profile.email

    // Users can see all comments
    const homeComments = comments
    const view = await homeView(homeComments, currentUser)

    return h.view('home', view)
  }
}
