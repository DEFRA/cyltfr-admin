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
      swRiskTypeOptions.forEach(selectedRadio => {
        selectedRadio.checked = false
        overrideYes.checked = false
        overrideYesCc.checked = false
      })
      swRiskTypeOptionsCc.forEach(selectedRadio => {
        selectedRadio.checked = false
        overrideYes.checked = false
        overrideYesCc.checked = false
      })
    })

    if (riskType[index] === 'Surface water') {
      swRadio.checked = true
      if (selectedRadio[index] === 'Do not override') {
        radio = document.getElementById(`map_${index}-no-override`)
      } else {
      radio = document.getElementById(`map_${index}-override`)
      swRiskValueContainer.classList.remove('hide')
      }
      radio.checked = true
      swRiskTypeOptions.forEach(option => { if (option.getAttribute('value') === selectedRadio[index]) { option.checked = true } })
    } else if (riskType[index] === 'Surface water climate change') {
      swRadioCc.checked = true
      if (selectedRadio[index] === 'Do not override') {
        radio = document.getElementById(`map_${index}-no-override`)
      } else {
        radio = document.getElementById(`map_${index}-override_cc`)
        swOverrideRadiosContainer.classList.add('hide')
        swOverrideRadiosContainerCc.classList.remove('hide')
      }
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

  const form = document.getElementById('comment-form-edit')

  // this event function has been added to check if any of the radio groups are not checked and to prevent a 'null' value
  // to be submitted when updating the risk value
  form.addEventListener('submit', (e) => {
    const features = geometry.features
    for (let index = 0 ; index < features.length ; index++) {
      const riskInputGroup = `override_${index}-risk`
      const yesGroupName = `override_${index}_cc`
  
      const parentRadios = form.querySelectorAll(`input[name="${riskInputGroup}"]`)
      const yesRadios = form.querySelectorAll(`input[name="${yesGroupName}"]`)
  
      const parentChecked = Array.from(parentRadios).find(r => r.checked)
      const yesChecked = Array.from(yesRadios).find(r => r.checked)
  
      if (!parentChecked && !yesChecked) {
        // nothing chosen in either group
        alert(`Please make a selection for risk override for item ${index + 1}`)
        e.preventDefault()
        return
      }
  
      if (yesChecked) {
        // user picked “Yes” in yes group, so the child risk options must be checked
        const childRadios = document.querySelectorAll(`.risk-option_${index}_cc`)
        const childVisibleRadios = Array.from(childRadios).filter(r => r.offsetParent !== null)
        const childChecked = childVisibleRadios.find(r => r.checked)
        if (!childChecked) {
          alert(`Please choose a risk level for Surface Water Climate Change override for item ${index + 1}`)
          e.preventDefault()
          return
        }
      }
    }
  })
})

document.addEventListener('DOMContentLoaded', window.LTFMGMT.sharedFunctions.addCharacterCounts)

commentMap(geometry, 'map', capabilities, 'The map below shows all geometries contained within the shapefile')
