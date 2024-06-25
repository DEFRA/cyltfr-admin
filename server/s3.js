const AWS = require('aws-sdk')
const config = require('./config')
const s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  region: config.awsBucketRegion,
  params: {
    Bucket: config.awsBucketName
  }
})

module.exports = s3
