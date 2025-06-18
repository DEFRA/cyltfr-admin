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
    console.log('feature: ', feature)
    console.log('riskType: ', riskType[index])
    let radio
    const swOverrideRadiosContiner = document.getElementById(`risk-override-radios_${index}`)
    const swOverrideRadiosContinerCc = document.getElementById(`risk-override-radios_${index}_cc`)
    const swRiskValueContainer = document.getElementById(`risk-options_${index}`)
    const swRiskValueContainerCc = document.getElementById(`risk-options_${index}_cc`)
    const swRiskTypeOptions = document.querySelectorAll(`.risk-option_${index}`)
    const swRiskTypeOptionsCc = document.querySelectorAll(`.risk-option_${index}_cc`)
    const swRadio = document.getElementById(`sw_${index}`)
    const swRadioCc = document.getElementById(`swcc_${index}`)

    if (riskType[index] === 'Surface water'){
      console.log('SW')
      swRadio.checked = true
      radio = document.getElementById(`map_${index}-override`)
      radio.checked = true
      swRiskValueContainer.classList.remove('hide')
      console.log('SselectedRadio[index]', selectedRadio[index])
      swRiskTypeOptions.forEach(option => { if (option.getAttribute('value') === selectedRadio[index]) { option.checked = true }})
    } else {
      swRadioCc.checked = true
      swOverrideRadiosContiner.classList.add('hide')
      swOverrideRadiosContinerCc.classList.remove('hide')
      console.log('swcc')
      radio = document.getElementById(`map_${index}-override_cc`)
      radio.checked = true
      console.log('radio', radio.checked)
      swRiskValueContainerCc.classList.remove('hide')
      swRiskTypeOptionsCc.forEach(option => { if (option.getAttribute('value') === selectedRadio[index]) { option.checked = true }})
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
