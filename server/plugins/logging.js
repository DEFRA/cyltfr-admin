const config = require('../config')

module.exports = {
  plugin: require('hapi-pino'),
  options: {
    level: config.isDev ? 'debug' : 'warn'
  }
}
