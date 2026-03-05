const { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3')
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

  async listEmailIds () {
    try {
      const command = new ListObjectsV2Command({
        Bucket: config.awsBucketName,
        Prefix: `${config.approversPrefix}/` // Correct way to filter by folder
      })

      const response = await s3Client.send(command)
      return response.Contents?.map((item) => {
        const itemId = item.Key.split('/').pop()
        if (itemId?.endsWith('.json')) { return (itemId.split('.')[0]) } else { return null }
      }).filter(Boolean) || [] // Returns files in the specific folder
    } catch (error) {
      console.error('Error listing bucket contents:', error)
      return []
    }
  }

  async getApprovedUser (itemId) {
    const result = await s3Client.send(new GetObjectCommand({
      Bucket: config.awsBucketName,
      Key: `${config.approversPrefix}/${itemId}.json`
    }))

    const textResult = await result.Body.transformToString()
    return JSON.parse(textResult)
  }

  async uploadApproverObject (keyname, data) {
    const toSend = JSON.stringify(data, null, 2)
    return s3Client.send(new PutObjectCommand({
      Bucket: config.awsBucketName,
      Key: `${config.approversPrefix}/${keyname}.json`,
      Body: toSend
    }))
  }

  async deleteApproverObject (keyname) {
    try {
      await s3Client.send(new DeleteObjectCommand({
        Bucket: config.awsBucketName,
        Key: `${config.approversPrefix}/${keyname}.json`
      }))
      return true
    } catch (error) {
      console.error('Error deleting approver from S3:', error)
      throw error
    }
  }

  async save (comments) {
    return s3Client.send(new PutObjectCommand({
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
