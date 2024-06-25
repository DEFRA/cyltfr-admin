const fs = require('fs')
const path = require('path')

// Base Map capabilities are pulled from a file rather than url.
// This saves pulling @hapi/wreck in and dealing with proxies.
// This should be fine so long as it's updated if needed.
const capabilitiesPath = path.join(__dirname, '../public/static/GetCapabilities.xml')
const capabilities = fs.readFileSync(capabilitiesPath, 'utf8')

module.exports = capabilities
