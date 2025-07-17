const spawn = require('child_process').spawn
const moment = require('moment-timezone')
const config = require('./config')
const { DATEFORMAT } = require('./constants')
const CONVERSION_BASE = 36
const validGeometyTypes = ['Polygon', 'MultiPolygon']
const Polygon = require('./services/polygon')

function shortId () {
  return Math.random().toString(CONVERSION_BASE).substring(2)
}

function formatDate (str, format = DATEFORMAT) {
  return moment(str).format(format)
}

async function updateAndValidateGeoJson (geojson, type) {
  if (geojson.crs?.properties?.name !== 'urn:ogc:def:crs:EPSG::27700') {
    throw new Error('Shape file contains invalid data. Must be in British National Grid (EPSG 27700) projection')
  }
  
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
    if (!validGeometyTypes.includes(f.geometry.type)) {
      throw new Error('Shape file contains invalid data. Must only contain Polygon types')
    }
  })
  return geojson
}

async function checkIntersects (polygon, indexedShapeData) {
    console.log('in fetch')
    let startTime
    if (config.performanceLogging) {
      startTime = performance.now()
    }

    // uses the returned values of the shape data (which can be false) and the current polygon (changed to a polygon object with attributes) to evaluate if they 
    // intersect
    const intersects = indexedShapeData.polygonHitTest(new Polygon(polygon))
    if (config.performanceLogging) {
      console.log('Check intersects: ', performance.now() - startTime)
    }

    // intersects is true or false
    return { intersects }
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
  updateAndValidateGeoJson,
  checkIntersects
}
