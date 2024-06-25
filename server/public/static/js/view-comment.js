;(function () {
  const geometry = window.LTFMGMT.geometry
  const capabilities = window.LTFMGMT.capabilities

  geometry.features.forEach(function (feature, index) {
    const geo = {
      ...geometry,
      features: geometry.features.filter(f => f === feature)
    }

    window.LTFMGMT.commentMap(geo, 'map_' + index, capabilities)
  })

  if (geometry.features.length > 1) {
    window.LTFMGMT.commentMap(geometry, 'map', capabilities)
  }
})()
