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

  // Map modal function
  window.openMapModal = function (index) {
    document.documentElement.style.setProperty('--scroll-y', `-${window.scrollY}px`)
    document.body.classList.add("disable-scroll")
    document.getElementById("mapModal").style.display = "block"
    
    // Ensure the modal map container is empty before inserting a new map
    document.getElementById("mapModalContent").innerHTML = `<div id='modal_map'></div>`
    
    // Reload the map inside the modal
    const feature = window.LTFMGMT.geometry.features[index]
    const geo = { ...window.LTFMGMT.geometry, features: [feature] }
    
    window.LTFMGMT.commentMap(geo, 'modal_map', window.LTFMGMT.capabilities)
  }

  window.closeMapModal = function () {
    document.getElementById("mapModal").style.display = "none"

    const pagePosition = document.documentElement.style.getPropertyValue('--scroll-y')
    document.body.classList.remove("disable-scroll")
    window.scrollTo(0, parseInt(pagePosition || '0') * -1)
  }

  // Close modal on background click
  window.onclick = function (event) {
    const modal = document.getElementById("mapModal")
    if (event.target === modal) {
      window.closeMapModal()
    }
  }
  document.querySelector('.map-modal-close').addEventListener('keydown', function(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      closeMapModal()
    }
  })
})()
