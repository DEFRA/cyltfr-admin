import { polygon as turfPolygon } from '@turf/helpers'
import { booleanIntersects } from '@turf/boolean-intersects'

// Used by the hit test route to confirm whether the polygons intersect

const polygonHitTest = (data = [], polygon = undefined) => {
  // checks incoming data has data and if the polygon object is not empty (converts to an array to check)
  if (data.length === 0 || !Array.isArray(polygon)) {
    return false
  }

  // uses turf helper to create a polygon feature with specific attributes
  polygon = turfPolygon([polygon])

  //iterates through data, checks if they have features, then iterates throught them (incase they have multiple) and finally responds true if
  // any intersect. 
  for (let itemIndex = 0; itemIndex < data.length; itemIndex++) {
    const item = data[itemIndex]
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
