const fs = require('fs')
const s3 = require('../../s3')
const config = require('../../config')
const manifestKey = `${config.holdingCommentsPrefix}/${config.manifestFilename}`

class S3Provider {
  async load () {
    const result = await this.getFile(manifestKey)

    return JSON.parse(result.Body.toString())
  }

  async save (comments) {
    return s3.putObject({
      Key: manifestKey,
      Body: JSON.stringify(comments, null, 2)
    }).promise()
  }

  async addComment (item) {
    const comments = await this.load()
    comments.push(item)
    return this.save(comments)
  }

  async getFile (key) {
    const result = await s3.getObject({
      Key: key
    }).promise()

    return result
  }

  async uploadFile (keyname, filename) {
    const data = await new Promise((resolve, reject) => {
      fs.readFile(filename, (err, readData) => {
        if (err) {
          reject(err)
        } else {
          resolve(readData)
        }
      })
    })

    await s3.putObject({
      Key: `${config.holdingCommentsPrefix}/${keyname}`,
      Body: data
    }).promise()
  }

  async uploadObject (keyname, data) {
    await s3.putObject({
      Key: `${config.holdingCommentsPrefix}/${keyname}`,
      Body: data
    }).promise()
  }

  async deleteFile (keyname) {
    await s3.deleteObject({
      Key: `${config.holdingCommentsPrefix}/${keyname}`
    }).promise()
  }

  async ensureManifestFile () {
    try {
      await s3.getObject({
        Key: manifestKey
      }).promise()
    } catch (err) {
      if (err.code === 'NoSuchKey') {
        await s3.putObject({
          Key: manifestKey,
          Body: '[]'
        }).promise()
      } else {
        throw err
      }
    }
  }
}

module.exports = S3Provider
