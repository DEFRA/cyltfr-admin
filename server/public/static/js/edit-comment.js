const commentMap = window.LTFMGMT.commentMap
const geometry = window.LTFMGMT.geometry
const capabilities = window.LTFMGMT.capabilities
const selectedRadio = window.LTFMGMT.selectedRadio
const riskType = window.LTFMGMT.riskType
const type = window.LTFMGMT.type
const textCommentRadio = window.LTFMGMT.textCommentRadio

document.addEventListener('DOMContentLoaded', () => {
  geometry.features.forEach(function (feature, index) {
    window.LTFMGMT.sharedFunctions.setInitialValues(index, type === 'holding', selectedRadio, feature.properties.riskType, textCommentRadio)
    let radio
    const swOverrideRadiosContainer = document.getElementById(`risk-override-radios_${index}`)
    const swOverrideRadiosContainerCc = document.getElementById(`risk-override-radios_${index}_cc`)
    const overrideYes = document.getElementById(`map_${index}-override`)
    const overrideYesCc = document.getElementById(`map_${index}-override_cc`)
    const swRiskValueContainer = document.getElementById(`risk-options_${index}`)
    const swRiskValueContainerCc = document.getElementById(`risk-options_${index}_cc`)
    const swRiskTypeOptions = document.querySelectorAll(`.risk-option_${index}`)
    const swRiskTypeOptionsCc = document.querySelectorAll(`.risk-option_${index}_cc`)
    const swRadio = document.getElementById(`sw_${index}`)
    const swRadioCc = document.getElementById(`swcc_${index}`)

    swRadio.addEventListener('click', () => {
      swRiskTypeOptions.forEach(radio => {
        radio.checked = false
        overrideYes.checked = false
        overrideYesCc.checked = false
        swRiskValueContainer.classList.add('hide')
        swRiskValueContainerCc.classList.add('hide')
      })
      swRiskTypeOptionsCc.forEach(radio => {
        radio.checked = false
        overrideYes.checked = false
        overrideYesCc.checked = false
        swRiskValueContainer.classList.add('hide')
        swRiskValueContainerCc.classList.add('hide')
      })
    })

    if (riskType[index] === 'Surface water'){
      swRadio.checked = true
      radio = document.getElementById(`map_${index}-override`)
      radio.checked = true
      swRiskValueContainer.classList.remove('hide')
      swRiskTypeOptions.forEach(option => { if (option.getAttribute('value') === selectedRadio[index]) { option.checked = true }})
    } else if (riskType[index] === 'Surface water climate change') {
      swRadioCc.checked = true
      swOverrideRadiosContainer.classList.add('hide')
      swOverrideRadiosContainerCc.classList.remove('hide')
      radio = document.getElementById(`map_${index}-override_cc`)
      radio.checked = true
      swRiskValueContainerCc.classList.remove('hide')
      swRiskTypeOptionsCc.forEach(option => { if (option.getAttribute('value') === selectedRadio[index]) { option.checked = true }})
    } else {
      const rsRadio = document.getElementById(`rs_${index}`)
      rsRadio.checked = true
      swOverrideRadiosContainer.classList.add('hide')
    }

    const geo = {
      ...geometry,
      features: geometry.features.filter(f => f === feature)
    }

    commentMap(geo, 'map_' + index, capabilities)
  })
})

document.addEventListener('DOMContentLoaded', window.LTFMGMT.sharedFunctions.addCharacterCounts)

commentMap(geometry, 'map', capabilities, 'The map below shows all geometries contained within the shapefile')
