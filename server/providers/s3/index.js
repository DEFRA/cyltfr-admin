const { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3')
const fs = require('fs')
const config = require('../../config')
const manifestKey = `${config.holdingCommentsPrefix}/${config.manifestFilename}`

const s3Client = new S3Client({
  region: config.awsBucketRegion
})

class S3Provider {
  async getFile (key) {
    const fileKey = key ? key : manifestKey
    const result = await s3Client.send(new GetObjectCommand({
      Bucket: config.awsBucketName,
      Key: fileKey
    }))

    return JSON.parse(await result.Body.transformToString())
  }

  async listBucketContents() {
    try {
      const command = new ListObjectsV2Command({ 
        Bucket: config.awsBucketName,
        Prefix: 'email-notified-approvers/' // Correct way to filter by folder
      })
  
      const response = await s3Client.send(command);
      console.log('in listbucket')
      return response.Contents || []; // Returns files in the specific folder
    } catch (error) {
      console.error("Error listing bucket contents:", error);
      return [];
    }
  }

  async getApprovedUsers (itemId) {
    const result = await s3Client.send(new GetObjectCommand({
      Bucket: config.awsBucketName,
      Key: `email-notified-approvers/${itemId}`
    }))

    return JSON.parse(await result.Body.transformToString())
  }

  async uploadApprover(keyname, data) {
    try {
      const params = {
        Bucket: 'email-notified-approver',
        Key: keyname,
        Body: data
      }
  
      const command = new PutObjectCommand(params)
      await this.s3Client.send(command)
    } catch (error) {
      console.error('Error uploading file to S3:', error)
      throw error
    }
  }

  async uploadApproverObject (keyname, data) {
    await s3Client.send(new PutObjectCommand({
      Bucket: config.awsBucketName,
      Key: `email-notified-approvers/${keyname}`,
      Body: data
    }))
  }

  async deleteApproverObject(keyname) {
    try {
      await s3Client.send(new DeleteObjectCommand({
        Bucket: config.awsBucketName,
        Key: `email-notified-approvers/${keyname}`
      }))
      return true
    } catch (error) {
      console.error('Error deleting approver from S3:', error)
      throw error
    }
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
