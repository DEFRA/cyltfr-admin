const { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3')
const fs = require('fs')
const config = require('../../config')
const manifestKey = `${config.holdingCommentsPrefix}/${config.manifestFilename}`

const s3Client = new S3Client({
  region: config.awsBucketRegion
})

class S3Provider {
  async getFile (key) {
    const fileKey = key || manifestKey
    const result = await s3Client.send(new GetObjectCommand({
      Bucket: config.awsBucketName,
      Key: fileKey
    }))

    return JSON.parse(await result.Body.transformToString())
  }

  async save (comments) {
    await s3Client.send(new PutObjectCommand({
      Bucket: config.awsBucketName,
      Key: manifestKey,
      Body: JSON.stringify(comments, null, 2)
    }))
  }

  async addComment (item) {
    const comments = await this.getFile()
    comments.push(item)
    return this.save(comments)
  }

  async uploadFile (keyname, filename) {
    const data = await fs.promises.readFile(filename)

    await s3Client.send(new PutObjectCommand({
      Bucket: config.awsBucketName,
      Key: `${config.holdingCommentsPrefix}/${keyname}`,
      Body: data
    }))
  }

  async uploadObject (keyname, data) {
    await s3Client.send(new PutObjectCommand({
      Bucket: config.awsBucketName,
      Key: `${config.holdingCommentsPrefix}/${keyname}`,
      Body: data
    }))
  }

  async deleteFile (keyname) {
    await s3Client.send(new DeleteObjectCommand({
      Bucket: config.awsBucketName,
      Key: `${config.holdingCommentsPrefix}/${keyname}`
    }))
  }

  async ensureManifestFile () {
    try {
      await s3Client.send(new GetObjectCommand({
        Bucket: config.awsBucketName,
        Key: manifestKey
      }))
    } catch (err) {
      if (err.name === 'NoSuchKey') {
        await s3Client.send(new PutObjectCommand({
          Bucket: config.awsBucketName,
          Key: manifestKey,
          Body: '[]'
        }))
      } else {
        throw err
      }
    }
  }
}

module.exports = S3Provider
