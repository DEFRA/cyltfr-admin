const CatboxObject = require('@hapi/catbox-object')

module.exports = {
  name: 'server_cache',
  provider: {
    constructor: CatboxObject.Engine
  }
}
