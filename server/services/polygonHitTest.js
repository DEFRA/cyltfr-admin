import { polygon as turfPolygon } from '@turf/helpers'
import { booleanIntersects } from '@turf/boolean-intersects'

const polygonHitTest = (data = [], polygon = undefined, approvedOnly = true) => {
  const dataToCheck = approvedOnly ? data.filter((item) => item.approvedBy) : data
  if (dataToCheck.length === 0 || !Array.isArray(polygon)) {
    return false
  }

  polygon = turfPolygon([polygon])

  for (let itemIndex = 0; itemIndex < dataToCheck.length; itemIndex++) {
    const item = dataToCheck[itemIndex]
    const features = item?.features?.features
    for (let featureIndex = 0; featureIndex < features.length; featureIndex++) {
      const geometry = features[featureIndex]?.geometry
      if (booleanIntersects(polygon, geometry)) {
        return true
      }
    }
  }
  return false
}

export { polygonHitTest }
