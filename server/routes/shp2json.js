const fs = require('fs')
const util = require('util')
const joi = require('joi')
const boom = require('@hapi/boom')
const helpers = require('../helpers')
const ogr2ogr = require('ogr2ogr').default
const rename = util.promisify(fs.rename)

module.exports = {
  method: 'POST',
  path: '/shp2json/{type}',
  handler: async (request, _h) => {
    const { payload, params } = request
    const { geometry } = payload

    try {
      const tmpfile = geometry.path
      const zipfile = tmpfile + '.zip'
      await rename(tmpfile, zipfile)

      let data
      try {
        ({ data } = await ogr2ogr(zipfile))
      } catch (error) {
        throw new Error('Could not process uploaded file. Check if it\'s a valid shapefile')
      }

      // uncomment the below to use dummy data to bypass having to upload an actual shape file on dev
      // const data = require('./dummy-data/example_file.json')
      // const data = require('./dummy-data/example_file_broken.json')

      const geojson = helpers.updateAndValidateGeoJson(data, params.type)

      return geojson
    } catch (err) {
      return boom.badRequest(err.message, err)
    }
  },
  options: {
    payload: {
      maxBytes: 209715200,
      output: 'file',
      parse: true,
      allow: 'multipart/form-data',
      multipart: true
    },
    validate: {
      params: joi.object().keys({
        type: joi.string().valid('holding', 'llfa').required()
      }),
      payload: joi.object().keys({
        geometry: joi.object().keys({
          bytes: joi.number().greater(0).required(),
          filename: joi.string().required(),
          headers: joi.object().required(),
          path: joi.string().required()
        }).required()
      })
    },
    app: {
      useErrorPages: false
    }
  }
}
