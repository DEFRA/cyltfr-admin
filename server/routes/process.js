const boom = require('@hapi/boom')
const { processManifest } = require('../services')

module.exports = [
  {
    method: 'GET',
    path: '/process',
    handler: async (_request, h) => {
      return h.view('process', { process })
    }
  },
  {
    method: 'POST',
    path: '/process',
    handler: async (request, h) => {
      try {
        const provider = request.provider
        const output = []
        const run = true
        const result = await processManifest(provider, (...args) => {
          output.push(args)
        })

        return h.view('process', { run, result, process, output: output.join('\n') })
      } catch (err) {
        return boom.badRequest(err.message, err)
      }
    }
  }
]
