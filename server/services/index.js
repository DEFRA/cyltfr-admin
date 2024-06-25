const fs = require('fs')
const util = require('util')
const config = require('../config')
const { run } = require('../helpers')
const writeFile = util.promisify(fs.writeFile)
const logger = console.log.bind(console)

function commentFilter (c) {
  return c.approvedBy
}

async function processManifest (provider, log = logger) {
  const result = {}

  log('Processing manifest')

  // Read manifest
  log('Reading manifest')
  const comments = await provider.load()
  log('Read manifest', comments.length)

  // Find active comments
  log('Filtering active comments')
  const activeComments = comments.filter(commentFilter)
  log('Active comments', activeComments.length)

  // Truncate the current data
  log('Truncate the extra info table')
  const truncateRes = await run('./dbscripts/truncate-table.sh', [], { env: process.env })
  log('Truncated the extra info table', truncateRes)

  // Unmark all loadedAt timestamps
  comments.forEach(comment => delete comment.loadedAt)

  // Find active comments
  for await (const comment of activeComments) {
    try {
      // Get the geo file
      const key = `${config.holdingCommentsPrefix}/${comment.keyname}`
      const file = await provider.getFile(key)

      // Make temporary directory
      log('Making a temp directory')
      const tmpDir = (await run('mktemp', ['-d'])).trim()
      log(`Made temp directory ${tmpDir}`)

      // Write temp geo file
      const tmpFileName = `${tmpDir}/geo.json`
      log(`Writing temp geospatial file ${key} as ${tmpFileName}`)
      await writeFile(tmpFileName, file.Body)
      log(`Wrote temp geospatial file ${key} as ${tmpFileName}`)

      // Shell env vars
      const env = {
        ...process.env,
        GEOSPATIALFILE: tmpFileName
      }

      // Load data
      log(`Loading the geospatial ${tmpFileName}`)
      const loadRes = await run('./dbscripts/load-data.sh', [], { env })
      log(`Loaded the geospatial ${tmpFileName}`, loadRes)

      // Update the comment
      comment.loadedAt = new Date()
      delete comment.lastError

      // Save
      await provider.save(comments)

      // Remove temporary directory
      log(`Removing temp directory ${tmpDir}`)
      await run('rm', ['-rf', tmpDir])
      log(`Removed temp directory ${tmpDir}`)

      result[comment.id] = true
    } catch (err) {
      comment.lastError = {
        message: (err?.toString()) || 'An error occured processing the file',
        timestamp: new Date()
      }

      log(`An error occured processing the comment ${comment.id}`, comment)

      // Save
      await provider.save(comments)

      result[comment.id] = comment.lastError.message
    }
  }

  // Clean data
  log('Cleaning the data')
  const cleanRes = await run('./dbscripts/clean-data.sh', [], { env: process.env })
  log('Cleaned the data', cleanRes)

  // Save
  await provider.save(comments)

  log('Processed manifest')

  return result
}

module.exports = {
  processManifest
}
