const { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3')
const config = require('../../config')
const manifestKey = `${config.holdingCommentsPrefix}/${config.manifestFilename}`

const s3Client = new S3Client({
  region: config.awsBucketRegion
})

class S3Provider {
  constructor () {
    this.cache = {}
  }

  setCache (key, value) {
    this.cache[key] = value
  }

  getCache (key) {
    return this.cache[key]
  }

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

  // Acquires a distributed lock via S3 so only one process runs the job
  // If a lock exists but is older than ttlSeconds, it is treated as stale and overwritten
  async acquireLock (lockKey, ttlSeconds = 300) {
    const lockPath = `${config.holdingCommentsPrefix}/locks/${lockKey}.json`
    const now = Date.now()

    // Check for a stale lock first and remove it if expired
    try {
      const existing = await s3Client.send(new GetObjectCommand({
        Bucket: config.awsBucketName,
        Key: lockPath
      }))
      const lockData = JSON.parse(await existing.Body.transformToString())
      if (now - lockData.acquiredAt < ttlSeconds * 1000) {
        return false // Lock is still valid
      }
      console.log(`Distributed lock '${lockKey}' is stale, overwriting.`)
    } catch (err) {
      if (err.name !== 'NoSuchKey') {
        throw err
      }
    }

    // Create the lock using IfNoneMatch (fails if object already exists)
    try {
      await s3Client.send(new PutObjectCommand({
        Bucket: config.awsBucketName,
        Key: lockPath,
        Body: JSON.stringify({ acquiredAt: now }),
        IfNoneMatch: '*'
      }))
      return true // Lock acquired
    } catch (err) {
      if (err.name === 'PreconditionFailed' || err.$metadata?.httpStatusCode === 412) {
        return false // Another process created the lock
      }
      throw err
    }
  }

  // Releases the distributed lock by deleting the lock file from S3
  // Always called in a finally block to ensure cleanup on success or failure
  async releaseLock (lockKey) {
    const lockPath = `${config.holdingCommentsPrefix}/locks/${lockKey}.json`
    try {
      await s3Client.send(new DeleteObjectCommand({
        Bucket: config.awsBucketName,
        Key: lockPath
      }))
    } catch (err) {
      console.error(`Error releasing distributed lock '${lockKey}':`, err)
    }
  }

  async cachedData () {
    const params = { Bucket: config.awsBucketName, Key: manifestKey }
    const getHeadCommand = new HeadObjectCommand(params)
    const manifestFile = await s3Client.send(getHeadCommand)
    const lastModified = this.getCache('lastModified')
    if (lastModified === undefined) {
      this.setCache('lastModified', '')
    }

    if (JSON.stringify(manifestFile.LastModified) === JSON.stringify(lastModified)) {
      if (config.performanceLogging) {
        console.log('Manifest file has not been modified since the last check.')
      }
      const cachedData = this.getCache('data')
      return cachedData
    } else {
      console.log('Manifest file has been modified since the last check.')
      const response = await this.getFile(manifestKey)
      const data = await this.loadFeatureData(response)
      this.setCache('lastModified', manifestFile.LastModified)
      this.setCache('data', data)

      return data
    }
  }
}

module.exports = S3Provider
