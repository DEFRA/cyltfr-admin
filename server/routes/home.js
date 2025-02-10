const homeView = require('../models/home-view')

module.exports = {
  method: 'GET',
  path: '/',
  handler: async (request, h) => {
    const { provider, auth } = request // eslint-disable-line no-use-before-define
    const comments = await provider.getFile()

    console.log('comments', comments)

    // Approvers can see all comments
    // Standard users only see their own
    const homeComments = comments    
    return h.view('home', homeView(homeComments))
  }
}
