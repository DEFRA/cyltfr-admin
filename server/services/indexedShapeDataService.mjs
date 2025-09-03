import { IndexedShapeData } from './indexedShapeData.mjs'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const config = require('../config.js')
let indexedShapeData
let _extraInfoServiceData

export const buildIndexedShapeData = async (extraInfoServiceData) => {
  if (extraInfoServiceData === _extraInfoServiceData) {
    if (config.performanceLogging) {
      console.log('extraInfoServiceData has not been modified since the last check.')
    }
    return
  }
  console.log('extraInfoServiceData has been modified, rebuilding indexedShapeData')
  _extraInfoServiceData = extraInfoServiceData
  indexedShapeData = new IndexedShapeData(extraInfoServiceData)
}

export const getIndexedShapeData = () => {
  return indexedShapeData || false
}
