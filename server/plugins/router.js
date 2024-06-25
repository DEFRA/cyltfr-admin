const routes = [].concat(
  require('../routes/auth'),
  require('../routes/home'),
  require('../routes/comment-file'),
  require('../routes/comment-create'),
  require('../routes/comment-edit'),
  require('../routes/process'),
  require('../routes/shp2json'),
  require('../routes/comment-guidance'),
  require('../routes/comments-csv'),
  require('../routes/status'),
  require('../routes/public')
)

module.exports = {
  plugin: {
    name: 'router',
    register: (server, _options) => {
      server.route(routes)
    }
  }
}
