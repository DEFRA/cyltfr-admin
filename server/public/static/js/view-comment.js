;(function () {
  const geometry = window.LTFMGMT.geometry
  const allFeatures = window.LTFMGMT.allFeatures
  const capabilities = window.LTFMGMT.capabilities

  geometry.features.forEach(function (feature, index) {
    const geo = {
      ...geometry,
      features: geometry.features.filter(f => f === feature)
    }

    window.LTFMGMT.commentMap(geo, 'map_' + index, capabilities)
  })

  // This flattens allFeatures so the map modal function still works correctly
  const flattenedFeatures = (allFeatures || []).flatMap(function (featureGroup) {
    if (Array.isArray(featureGroup)) {
      return featureGroup
    }

    if (featureGroup && Array.isArray(featureGroup.features)) {
      return featureGroup.features
    }

    return []
  })

  if (flattenedFeatures.length) {
    const geo = {
      ...geometry,
      features: flattenedFeatures
    }

    window.LTFMGMT.commentMap(geo, 'map_whole', capabilities)
  }

  if (geometry.features.length > 1) {
    window.LTFMGMT.commentMap(geometry, 'map', capabilities)
  }

  // Map modal function
  window.openMapModal = function (index) {
    document.documentElement.style.setProperty('--scroll-y', `-${window.scrollY}px`)
    document.body.classList.add('disable-scroll')
    document.getElementById('mapModal').style.display = 'block'

    // Empties Modal before inserting a new map
    document.getElementById('mapModalContent').innerHTML = '<div id="modal_map"></div>'

    // Reload the map inside the modal
    const feature = window.LTFMGMT.geometry.features[index]
    const geo = { ...window.LTFMGMT.geometry, features: [feature] }

    window.LTFMGMT.commentMap(geo, 'modal_map', window.LTFMGMT.capabilities)
  }

  window.closeMapModal = function () {
    document.getElementById('mapModal').style.display = 'none'

    const pagePosition = document.documentElement.style.getPropertyValue('--scroll-y')
    document.body.classList.remove('disable-scroll')
    window.scrollTo(0, parseInt(pagePosition || '0') * -1)
  }

  // Close modal options
  window.onclick = function (event) {
    const modal = document.getElementById('mapModal')
    if (event.target === modal) {
      window.closeMapModal()
    }
  }
  const closeButton = document.querySelector('.map-modal-close')
  const handleClose = (event) => {
    if (!event.key || event.key === 'Enter' || event.key === ' ') {
      window.closeMapModal()
    }
  }
  closeButton.addEventListener('click', handleClose)
  closeButton.addEventListener('keydown', handleClose)

  // Permission modal function
  const permissionModal = document.getElementById('permission-modal')
  const permissionModalClose = document.getElementById('permission-modal-close')
  const editButton = document.getElementById('edit-comment-button')

  function openPermissionModal () {
    if (!permissionModal || !permissionModalClose) {
      return
    }
    
      const mapModal = document.getElementById('mapModal')
      if (mapModal && mapModal.style.display === 'block' && typeof window.closeMapModal === 'function') {
        window.closeMapModal()
      }

    if (!permissionModal.open) {
      document.documentElement.style.setProperty('--scroll-y', `-${window.scrollY}px`)
      document.body.classList.add('disable-scroll')
      permissionModal.showModal()
    }
    permissionModalClose.focus()
  }

  function closePermissionModal () {
    if (permissionModal && permissionModal.open) {
      permissionModal.close()

      const pagePosition = document.documentElement.style.getPropertyValue('--scroll-y')
      document.body.classList.remove('disable-scroll')
      window.scrollTo(0, parseInt(pagePosition || '0') * -1)
    }
  }

  if (permissionModal && permissionModalClose) {
    permissionModalClose.addEventListener('click', function () {
      closePermissionModal()
    })

    permissionModal.addEventListener('click', function (event) {
      const rect = permissionModal.getBoundingClientRect()
      const outsideModal =
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom

      if (outsideModal) {
        closePermissionModal()
      }
    })
  }

  if (editButton && editButton.dataset.allowEdit === 'false') {
    editButton.addEventListener('click', function (event) {
      event.preventDefault()
      openPermissionModal()
    })
  }
})()
