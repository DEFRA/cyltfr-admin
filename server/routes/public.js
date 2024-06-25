module.exports = [
  {
    method: 'GET',
    path: '/favicon.ico',
    handler: {
      file: 'server/public/static/images/icons/favicon.ico'
    }
  }, {
    method: 'GET',
    path: '/assets/{path*}',
    handler: {
      directory: {
        path: [
          'server/public/static',
          'server/public/build'
        ]
      }
    }
  }
]
