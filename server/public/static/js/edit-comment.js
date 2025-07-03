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


    swRadio.addEventListener('change', () => {
      swRiskValueContainer.classList.add('hide')
      swRiskValueContainerCc.classList.add('hide')
      swRiskTypeOptions.forEach(radio => {
        radio.checked = false
        overrideYes.checked = false
        overrideYesCc.checked = false
      })
      swRiskTypeOptionsCc.forEach(radio => {
        radio.checked = false
        overrideYes.checked = false
        overrideYesCc.checked = false
      })
    })

    if (riskType[index] === 'Surface water') {
      swRadio.checked = true
      radio = document.getElementById(`map_${index}-override`)
      radio.checked = true
      swRiskValueContainer.classList.remove('hide')
      swRiskTypeOptions.forEach(option => { if (option.getAttribute('value') === selectedRadio[index]) { option.checked = true } })
    } else if (riskType[index] === 'Surface water climate change') {
      swRadioCc.checked = true
      swOverrideRadiosContainer.classList.add('hide')
      swOverrideRadiosContainerCc.classList.remove('hide')
      radio = document.getElementById(`map_${index}-override_cc`)
      radio.checked = true
      swRiskValueContainerCc.classList.remove('hide')
      swRiskTypeOptionsCc.forEach(option => { if (option.getAttribute('value') === selectedRadio[index]) { option.checked = true } })
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

const form = document.getElementById('comment-form-edit')

form.addEventListener('submit', (e) => {
  const radioNamePatterns = [/^override_\d+-risk$/, /^override_\d+$/, /^override_\d+_cc$/]
  const radios = form.querySelectorAll('input[type="radio"]')

  const radiosToCheck = Array.from(radios).filter(radio => {
    return radioNamePatterns.some(pattern => pattern.test(radio.name))
  })

  const groupedRadios = radiosToCheck.reduce((groups, radio) => {
    if (!groups[radio.name]) {
      groups[radio.name] = []
    }
    groups[radio.name].push(radio)
    return groups
  }, {})

  for (const [_name, groupRadios] of Object.entries(groupedRadios)) {
    const anyVisible = groupRadios.some(radio => {
      return radio.offsetParent !== null
    })

    if (!anyVisible) continue

    const anyChecked = groupRadios.some(r => r.checked)
    if (!anyChecked) {
      console.log('here')
      alert('Please make a selection for risk override.')
      e.preventDefault()
      return
    }
  }
})

document.addEventListener('DOMContentLoaded', window.LTFMGMT.sharedFunctions.addCharacterCounts)

commentMap(geometry, 'map', capabilities, 'The map below shows all geometries contained within the shapefile')
