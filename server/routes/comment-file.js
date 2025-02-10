const boom = require('@hapi/boom')

module.exports = {
  method: 'GET',
  path: '/comment/file/{key}',
  handler: async (request, _h) => {
    const provider = request.provider
    const { key } = request.params

    try {
      const file = await provider.getFile(key)

      return file.Body
    } catch (err) {
      return boom.notFound('File not found')
    }
  }
}
