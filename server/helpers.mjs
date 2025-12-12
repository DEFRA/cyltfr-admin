import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const spawn = require('node:child_process').spawn
const moment = require('moment-timezone')
const config = require('./config')
const { DATEFORMAT } = require('./constants')
const CONVERSION_BASE = 36
const validGeometyTypes = new Set(['Polygon', 'MultiPolygon'])

export function shortId () {
  return Math.random().toString(CONVERSION_BASE).substring(2) // NOSONAR
}

export function formatDate (str, format = DATEFORMAT) {
  return moment(str).format(format)
}

export async function updateAndValidateGeoJson (geojson, type) {
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
    if (!validGeometyTypes.has(f.geometry.type)) {
      throw new Error('Shape file contains invalid data. Must only contain Polygon types')
    }
  })
  return geojson
}

export async function checkIntersects (polygon, indexedShapeData) {
  let startTime
  if (config.performanceLogging) {
    startTime = performance.now()
  }

  // uses the returned values of the shape data (which can be false) and the current polygon (changed to a polygon object with attributes) to evaluate if they
  // intersect
  const Polygon = await import('./services/polygon.mjs')

  const intersects = indexedShapeData.polygonHitTest(new Polygon(polygon))
  if (config.performanceLogging) {
    console.log('Check intersects: ', performance.now() - startTime)
  }

  // intersects is true or false
  return { intersects }
}

export function run (cmd, args, opts) {
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

// module.exports = {
//   run,
//   shortId,
//   formatDate,
//   updateAndValidateGeoJson,
//   checkIntersects
// }
