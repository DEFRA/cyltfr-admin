import { point } from '@turf/helpers'
import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import { performance } from 'node:perf_hooks'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const config = require('../config.js')

export const getExtraInfoDataS3 = async () => {
  let startTime
  if (config.performanceLogging) {
    startTime = performance.now()
  }
  const { default: S3Provider } = await import('../providers/s3/index.js')
  const s3 = new S3Provider()
  const data = await s3.cachedData()

  if (config.performanceLogging) {
    console.log('Extra info data load time: ', performance.now() - startTime)
  }
  return data
}

// const getExtraInfoDataFile = async () => {
//   const fileDataLoader = await import('./__mocks__/s3dataLoader.js')
//   const data = await fileDataLoader.default()
//   return data
// }

export const getExtraInfoData = getExtraInfoDataS3

export const formatExtraInfo = function (extraInfoData) {
  const retVal = []

  extraInfoData.forEach((item) => {
    retVal.push({
      info: item[0].properties.info,
      apply: item[0].properties.apply,
      riskoverride: item[0].properties.riskOverride,
      risktype: item[0].properties.riskType
    })
  })
  return retVal
}

export const featuresAtPoint = (data, x, y, approvedOnly) => {
  const pointToCheck = point([x, y])
  const dataToCheck = approvedOnly ? data.filter((item) => item.approvedBy) : data
  const dataToReturn = []
  dataToCheck.forEach((item) => {
    item.features.features.forEach((feature) => {
      if (booleanPointInPolygon(pointToCheck, feature)) {
        dataToReturn.push([feature])
      }
    })
  })
  return dataToReturn
}
