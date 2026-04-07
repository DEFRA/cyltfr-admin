/**
 * Service for handling polygon intersection checks
 * Consolidates intersection logic used across the application
 */

/**
 * Find intersecting comments using indexed shape data
 * More efficient for checking multiple features
 *
 * @param {Object} indexedShapeData - The indexed shape data
 * @param {Array} features - Array of GeoJSON features to check
 * @param {Function} PolygonClass - The Polygon class constructor
 * @returns {Object} Object with features and intersects. That is the updated features object and intersects, the intersecting comment values
 */
export function findIntersectionsWithIndexedData (indexedShapeData, features, PolygonClass) {
  let intersects = []

  for (const feature of features) {
    const uploadCoordinates = feature.geometry.coordinates
    const uploadPolygon = new PolygonClass(uploadCoordinates[0])
    const featureIntersects = indexedShapeData.polygonHitTest(uploadPolygon, features.id)
    feature.intersects = featureIntersects
    intersects = intersects.concat(featureIntersects)
  }

  return { features, intersects }
}
