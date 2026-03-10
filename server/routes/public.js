module.exports = [
  {
    method: 'GET',
    path: '/favicon.ico',
    options: { tags: ['assets'] },
    handler: {
      file: 'server/public/static/images/icons/favicon.ico'
    }
  }, {
    method: 'GET',
    path: '/assets/{path*}',
    options: { tags: ['assets'] },
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
