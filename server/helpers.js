const spawn = require('child_process').spawn
const moment = require('moment-timezone')
const { DATEFORMAT } = require('./constants')
const CONVERSION_BASE = 36

function shortId () {
  return Math.random().toString(CONVERSION_BASE).substring(2)
}

function formatDate (str, format = DATEFORMAT) {
  return moment(str).format(format)
}

function updateAndValidateGeoJson (geojson, type) {
  geojson.features.forEach(f => {
    const props = f.properties
    f.properties = {
      apply: type,
      start: props.Start_date
        ? moment(props.Start_date, 'YYYY/MM/DD').format('YYYY-MM-DD')
        : '',
      end: props.End_date
        ? moment(props.End_date, 'YYYY/MM/DD').format('YYYY-MM-DD')
        : '',
      info: props.display2 || props.Data_Type || ''
    }
    if (f.geometry.type !== 'Polygon') {
      throw new Error('Shape file contains invalid data. Must only contain Polygon types')
    }
  })
  return geojson
}

function run (cmd, args, opts) {
  return new Promise((resolve, reject) => {
    console.log('Spawning', cmd, args, opts)
    const cp = spawn(cmd, args, opts)
    console.log('Spawned', cmd, args, opts)
    let stdout = ''
    let stderr = ''

    cp.stdout.on('data', (data) => {
      stdout += data
    })

    cp.stderr.on('data', (data) => {
      stderr += data
    })

    cp.on('error', reject)

    cp.on('close', (code) => {
      if (code === 0) {
        resolve(stdout)
      } else {
        reject(new Error(`${stderr}, ${code}`))
      }
    })
  })
}

module.exports = {
  run,
  shortId,
  formatDate,
  updateAndValidateGeoJson
}
