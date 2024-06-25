;(function () {
  function commentMap (geojson, target, capabilities, title) {
    const ol = window.ol
    const proj4 = window.proj4
    const COORD_SYSTEM = 'EPSG:27700'
    const DEFAULT_EXTENT = [0, 0, 700000, 1300000]

    const vectorSource = new ol.source.Vector({
      features: (new ol.format.GeoJSON()).readFeatures(geojson)
    })

    const styleFunction = function (_feature) {
      return new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'blue',
          lineDash: [4],
          width: 3
        }),
        fill: new ol.style.Fill({
          color: 'rgba(0, 0, 255, 0.1)'
        })
      })
    }

    const vectorLayer = new ol.layer.Vector({
      source: vectorSource,
      style: styleFunction
    })

    proj4.defs(COORD_SYSTEM, '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 ' +
        '+x_0=400000 +y_0=-100000 +ellps=airy ' +
        '+towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 ' +
        '+units=m +no_defs')
    ol.proj.proj4.register(proj4)
    const proj27700 = ol.proj.get(COORD_SYSTEM)
    proj27700.setExtent(DEFAULT_EXTENT)

    const parser = new ol.format.WMTSCapabilities()
    const result = parser.read(capabilities)

    const options = ol.source.WMTS.optionsFromCapabilities(result, {
      layer: 'Road_27700',
      matrixSet: COORD_SYSTEM,
      crossOrigin: 'anonymous'
    })

    const source = new ol.source.WMTS(options)

    const layer = new ol.layer.Tile({
      ref: 'osgb',
      source
    })

    const map = new ol.Map({
      target,
      view: new ol.View({
        projection: proj27700,
        center: [0, 0],
        zoom: 2
      }),
      layers: [
        layer,
        vectorLayer
      ],
      controls: ol.control.defaults({ attribution: false })
    })

    map.setView(new ol.View({
      projection: COORD_SYSTEM
    }))

    const ext = vectorSource.getExtent()
    map.getView().fit(ext, map.getSize())

    map.on('singleclick', function (evt) {
      console.log(evt.coordinate.map(function (p) {
        return Math.round(p)
      }))
    })

    if (title) {
      const titleEl = document.createElement('h3')
      titleEl.textContent = title
      const mapEl = map.getTargetElement()
      mapEl.parentNode.insertBefore(titleEl, mapEl)
    }
  }

  window.LTFMGMT.commentMap = commentMap
})()
