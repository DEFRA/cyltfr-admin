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
    const swOverrideRadiosContiner = document.getElementById(`risk-override-radios_${index}`)
    const rsOverrideRadiosContiner = document.getElementById(`risk-override-radios_${index}_rs`)
    const rsOverrideRadiosContinerCC = document.getElementById(`risk-override-radios_${index}_rscc`)
    const swRiskValueContainer = document.getElementById(`risk-options_${index}`)
    const rsRiskValueContainer = document.getElementById(`risk-options_${index}_rs`)
    const rsRiskValueContainerCC = document.getElementById(`risk-options_${index}_rscc`)
    const swRiskTypeOptions = document.querySelectorAll(`.risk-option_${index}`)
    const rsRiskTypeOptions = document.querySelectorAll(`.risk-option_${index}_rs`)
    const rsRiskTypeOptionsCC = document.querySelectorAll(`.risk-option_${index}_rscc`)
    const swRadio = document.getElementById(`sw_${index}`)
    const rsRadio = document.getElementById(`rs_${index}`)
    const rsRadioCC = document.getElementById(`rscc_${index}`)

    if (riskType[index] === 'Surface water'){
      swRadio.checked = true
      swOverrideRadiosContiner.classList.remove('hide')
      rsOverrideRadiosContiner.classList.add('hide')
      rsOverrideRadiosContinerCC.classList.add('hide')     
      radio = document.getElementById(`map_${index}-override`)
      radio.checked = true
      swRiskValueContainer.classList.remove('hide')
      swRiskTypeOptions.forEach(option => { if (option.getAttribute('value') === selectedRadio[index]) { option.checked = true }})
    } else if (riskType[index] === 'Rivers and the sea'){
      rsRadio.checked = true
      swOverrideRadiosContiner.classList.add('hide')
      rsOverrideRadiosContiner.classList.remove('hide')
      rsOverrideRadiosContinerCC.classList.add('hide')
      radio = document.getElementById(`map_${index}-override_rs`)
      radio.checked = true
      rsRiskValueContainer.classList.remove('hide')
      rsRiskTypeOptions.forEach(option => { if (option.getAttribute('value') === selectedRadio[index]) { option.checked = true }})
    } else if (riskType[index] === 'Rivers and the sea climate change') {
      rsRadioCC.checked = true
      swOverrideRadiosContiner.classList.add('hide')
      rsOverrideRadiosContiner.classList.add('hide')
      rsOverrideRadiosContinerCC.classList.remove('hide')
      radio = document.getElementById(`map_${index}-override_rscc`)
      radio.checked = true
      rsRiskValueContainerCC.classList.remove('hide')
      rsRiskTypeOptionsCC.forEach(option => { if (option.getAttribute('value') === selectedRadio[index]) { option.checked = true }})
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
