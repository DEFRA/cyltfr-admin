const boom = require('@hapi/boom')
const config = require('../config')

module.exports = [{
  method: 'GET',
  path: '/login',
  handler: (request, h) => {
    if (!request.auth.isAuthenticated) {
      const message = request.auth.error?.message
      return boom.unauthorized(`Authentication failed due to: ${message}`)
    }

    const { profile } = request.auth.credentials
    const roles = []
    const scope = []

    if (profile.raw.roles) {
      roles.push(...JSON.parse(profile.raw.roles))
    }

    const isApprover = roles.includes('Approver')

    if (isApprover) {
      scope.push('approve:comments')
    }

    request.cookieAuth.set({
      scope,
      isApprover,
      roles,
      profile
    })

    return h.redirect('/')
  },
  options: {
    auth: 'azuread'
  }
}, {
  method: 'GET',
  path: '/logout',
  handler: function (request, h) {
    request.cookieAuth.clear()
    return h.redirect(`https://login.microsoftonline.com/${config.adTenant}/oauth2/v2.0/logout?post_logout_redirect_uri=${config.homePage}`)
  }
}]
