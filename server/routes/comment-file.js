const boom = require('@hapi/boom')
const s3 = require('../s3')
const config = require('../config')

module.exports = {
  method: 'GET',
  path: '/comment/file/{key}',
  handler: async (request, _h) => {
    const { key } = request.params

    try {
      const file = await s3.getObject({
        Key: `${config.holdingCommentsPrefix}/${key}`
      }).promise()

      return file.Body
    } catch (err) {
      return boom.notFound('File not found')
    }
  }
}
