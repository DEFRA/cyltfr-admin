const { buildIndexedShapeData } = require('../services/indexedShapeDataService.js')

module.exports = {
  plugin: {
    name: 'dataRefresh',
    register: (server, options) => {
      const setupTimeout = () => {
        return setTimeout(() => {
          timeoutHandle = null
          server.methods.getExtraInfoData()
            .then((extraInfoServiceData) => buildIndexedShapeData(extraInfoServiceData))
            .then(() => { timeoutHandle = setupTimeout() })
            .catch((err) => {
              console.error('Error refreshing data', err)
              timeoutHandle = setupTimeout()
            })
        }, options.time + 500) // NOSONAR
      }
      let timeoutHandle = setupTimeout()
      server.events.on('closing', () => {
        console.log('Clearing data refresh Timeout')
        clearTimeout(timeoutHandle)
      })
      server.events.on('start', () => {
        console.log('Fetching data at startup')
        server.methods.getExtraInfoData()
          .then((extraInfoServiceData) => buildIndexedShapeData(extraInfoServiceData))
      })
    }
  }
}
