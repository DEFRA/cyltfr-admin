import { bbox } from '@turf/bbox'
import { booleanIntersects } from '@turf/boolean-intersects'
const indexSquareSize = 1000

export class IndexedShapeData {
  constructor (extraInfoData) {
    this.extraInfoData = extraInfoData
    this.indexedData = new Map()
    this.geometryArray = this.dataToArray(this.extraInfoData)
    console.log('IndexedShapeData has finished building')
  }

  dataToArray () {
    const array = []
    const dataToCheck = this.extraInfoData
    let index = 0

    dataToCheck.forEach((item) => {
      const features = item?.features?.features || []
      features.forEach((feature) => {
        const boundingBox = bbox(feature?.geometry)
        const { id } = item
        const geometry = { id, boundingBox, ...feature?.geometry }
        array[index] = geometry
        const xyIndexPoints = IndexedShapeData.getXYIndexPoints(boundingBox)
        // console.log(JSON.stringify({ index, id, boundingBox }, null, 4))
        this.setIndexedDataItem(xyIndexPoints, index)
        index++
      })
    })
    console.log('array: ', array)
    return array
  }

  static getXYIndexPoints ([xmin, ymin, xmax, ymax]) {
    const xyIndexPoints = []
    for (let x = Math.floor(xmin / indexSquareSize); x <= Math.floor(xmax / indexSquareSize); x++) {
      for (let y = Math.floor(ymin / indexSquareSize); y <= Math.floor(ymax / indexSquareSize); y++) {
        const key = `${x},${y}`
        xyIndexPoints.push(key)
      }
    }
    return xyIndexPoints
  }

  setIndexedDataItem (xyIndexPoints, index) {
    xyIndexPoints.forEach((key) => {
      const indexSet = this.indexedData.get(key) || new Set()
      indexSet.add(index)
      this.indexedData.set(key, indexSet)
    })
  }

  getPossibleIntersectIndices (polygon) {
    // Can replace this reducer with union once we upgrade to Node 22.0 or above
    return polygon.xyIndexPoints.reduce((keys, key) => {
      const values = this.indexedData.get(key)
      if (this.indexedData.has(key)) {
        keys = new Set([...keys, ...values])
      }
      return keys
    }, new Set())
  }

  polygonHitTest (polygon) {
    if (!polygon) {
      return false
    }
    return [...this.getPossibleIntersectIndices(polygon)].find((index) => booleanIntersects(polygon.turfPolygon, this.geometryArray[index])) !== undefined
  }
}
