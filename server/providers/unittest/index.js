class FileProvider {
  constructor () {
    this.cache = {}
    this.fs = import('fs')
    this.path = import('path')
  }

  async fileLoader (filepath, filename) {
    const data = this.fs.readFileSync(this.path.join(filepath, filename))
    const jsonData = JSON.parse(data)
    return this.loadFeatureData(jsonData, filepath)
  }

  loadFeatureData (jsonData, filepath) {
    const errors = []

    jsonData.forEach((item, index) => {
      try {
        if (item.keyname === undefined) {
          throw new Error(`Item at index ${index} is missing keyname`)
        }
        const featureData = this.loadIndividualFeature(item, filepath)
        item.features = featureData
      } catch (error) {
        errors.push(error.message)
        // Continue processing other items
      }
    })

    // If there were any errors, log them
    if (errors.length > 0) {
      console.error('Errors encountered while processing data:', errors)
    }

    return jsonData
  }

  loadIndividualFeature (item, filepath) {
    const key = item.keyname
    const data = this.fs.readFileSync(this.path.join(filepath, key))
    const jsonData = JSON.parse(data)
    return jsonData
  }

  setCache (key, value) {
    this.cache[key] = value
  }

  getCache (key) {
    return this.cache[key]
  }

  async getFile (key) {
    return ''
  }

  async listEmailIds () {
    return []
  }

  async getApprovedUser (itemId) {
  }

  async uploadApproverObject (keyname, data) {
  }

  async deleteApproverObject (keyname) {
  }

  async save (comments) {
  }

  async addComment (item) {
    const comments = await this.getFile()
    comments.push(item)
    return this.save(comments)
  }

  async uploadObject (keyname, data) {
  }

  async deleteFile (keyname) {
  }

  async ensureManifestFile () {
  }

  async cachedData () {
    const retdata = this.fileLoader('./server/providers/unittest/__tests__/data', 'manifest.json')
    return retdata
  }
}

module.exports = FileProvider
