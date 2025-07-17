const { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3')
const fs = require('fs')
const config = require('../../config')
const manifestKey = `${config.holdingCommentsPrefix}/${config.manifestFilename}`
const { setCache, getCache } = require('../../services/serverCache')


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

  async loadFeatureData (jsonData) {
    await Promise.all(jsonData.map(async (item) => {
      const itemResponse = await this.getFile(`${config.holdingCommentsPrefix}/${item.keyname}`)
      item.features = itemResponse
    }))
    return jsonData
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

  async cachedData () {
    const params = { Bucket: config.awsBucketName, Key: manifestKey }
    const getHeadCommand = new HeadObjectCommand(params)
    const manifestFile = await s3Client.send(getHeadCommand)
    const lastModified = getCache('lastModified')
    if (lastModified === undefined) {
      setCache('lastModified', '')
    }

    if (JSON.stringify(manifestFile.LastModified) === JSON.stringify(lastModified)) {
      if (config.performanceLogging) {
        console.log('Manifest file has not been modified since the last check.')
      }
      const cachedData = getCache('data')
      return cachedData
    } else {
      console.log('Manifest file has been modified since the last check.')
      const response = await this.getFile(manifestKey)
      const data = await this.loadFeatureData(response)
      setCache('lastModified', manifestFile.LastModified)
      setCache('data', data)

      return data
    }
  }
}

module.exports = S3Provider
