const joi = require('joi')
require('dotenv/config')

// Define config schema
const schema = joi.object().keys({
  env: joi.string().valid('dev', 'test', 'prod-green', 'prod-blue').default('dev'),
  port: joi.number().default(3000),
  adClientId: joi.string().required(),
  adClientSecret: joi.string().required(),
  adTenant: joi.string().required(),
  cookiePassword: joi.string().required(),
  isSecure: joi.boolean().default(false),
  forceHttps: joi.boolean().default(false),
  homePage: joi.string().default('http://localhost:3000'),
  awsBucketRegion: joi.string().required(),
  awsBucketName: joi.string().required(),
  holdingCommentsPrefix: joi.string().default('holding-comments'),
  manifestFilename: joi.string().default('manifest.json')
})

// Build config
const config = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  adClientId: process.env.AD_CLIENT_ID,
  adClientSecret: process.env.AD_CLIENT_SECRET,
  adTenant: process.env.AD_TENANT,
  cookiePassword: process.env.AD_COOKIE_PASSWORD,
  isSecure: process.env.IS_SECURE,
  forceHttps: process.env.FORCE_HTTPS,
  homePage: process.env.HOME_PAGE,
  awsBucketRegion: process.env.AWS_BUCKET_REGION,
  awsBucketName: process.env.AWS_BUCKET_NAME,
  holdingCommentsPrefix: process.env.HOLDING_COMMENTS_PREFIX,
  manifestFilename: process.env.MANIFEST_FILENAME
}

// Validate config
const { error, value } = schema.validate(config)

// Throw if config is invalid
if (error) {
  throw new Error(`The server config is invalid. ${error.message}`)
}

// Add some helper props
value.isDev = value.env === 'dev'
value.isTest = value.env === 'test'
value.isProd = value.env.startsWith('prod-')

module.exports = value
