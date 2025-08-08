const commentMap = window.LTFMGMT.commentMap
const geometry = window.LTFMGMT.geometry
const capabilities = window.LTFMGMT.capabilities
const selectedRadio = window.LTFMGMT.selectedRadio
const riskType = window.LTFMGMT.riskType
const type = window.LTFMGMT.type
const textCommentRadio = window.LTFMGMT.textCommentRadio
const DoNotOverride = 'Do not override'

// Function to update warning visibility
function updateOverrideWarnings (index) {
  const swRadio = document.getElementById(`sw_${index}`)
  const rsRadio = document.getElementById(`rs_${index}`)

  const noOverrideRadio = document.getElementById(`map_${index}-no-override`)
  const overrideRadioCC = document.getElementById(`map_${index}-override_cc`)
  const riskOverrideWarning = document.getElementById(`risk-override-warning_${index}`)
  const riskOverrideWarningCC = document.getElementById(`risk-override-warning_${index}_cc`)

  const noOverrideRadioRS = document.getElementById(`map_${index}-no-override_rs`)
  const overrideRadioRSCC = document.getElementById(`map_${index}-override_rscc`)
  const riskOverrideWarningRS = document.getElementById(`risk-override-warning_${index}_rs`)
  const riskOverrideWarningRSCC = document.getElementById(`risk-override-warning_${index}_rscc`)

  if (swRadio?.checked) {
    if (noOverrideRadio?.checked) {
      riskOverrideWarning?.classList.add('hide')
    } else {
      riskOverrideWarning?.classList.remove('hide')
    }

    if (overrideRadioCC?.checked) {
      riskOverrideWarningCC?.classList.remove('hide')
    } else {
      riskOverrideWarningCC?.classList.add('hide')
    }

    riskOverrideWarningRS?.classList.add('hide')
    riskOverrideWarningRSCC?.classList.add('hide')
  } else if (rsRadio?.checked) {
    if (noOverrideRadioRS?.checked) {
      riskOverrideWarningRS?.classList.add('hide')
    } else {
      riskOverrideWarningRS?.classList.remove('hide')
    }

    if (overrideRadioRSCC?.checked) {
      riskOverrideWarningRSCC?.classList.remove('hide')
    } else {
      riskOverrideWarningRSCC?.classList.add('hide')
    }

    riskOverrideWarning?.classList.add('hide')
    riskOverrideWarningCC?.classList.add('hide')
  } else {
    riskOverrideWarning?.classList.add('hide')
    riskOverrideWarningCC?.classList.add('hide')
    riskOverrideWarningRS?.classList.add('hide')
    riskOverrideWarningRSCC?.classList.add('hide')
  }
}

document.addEventListener('DOMContentLoaded', () => {
  geometry.features.forEach(function (feature, index) {
    window.LTFMGMT.sharedFunctions.setInitialValues(index, type === 'holding', selectedRadio, [feature.properties.riskType], textCommentRadio)
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

    const rsOverrideRadiosContainer = document.getElementById(`risk-override-radios_${index}_rs`)
    const rsOverrideRadiosContainerCc = document.getElementById(`risk-override-radios_${index}_rscc`)
    const overrideYesRs = document.getElementById(`map_${index}-override_rs`)
    const overrideYesRsCc = document.getElementById(`map_${index}-override_rscc`)
    const rsRiskValueContainer = document.getElementById(`risk-options_${index}_rs`)
    const rsRiskTypeOptions = document.querySelectorAll(`.risk-option_${index}_rs`)
    const rsRadio = document.getElementById(`rs_${index}`)

    // On changing the risk type (SW, SWCC or RS) the radio buttons are reset to unselected
    swRadio.addEventListener('change', () => {
      swRiskValueContainer.classList.add('hide')
      swRiskValueContainerCc.classList.add('hide')
      swRiskTypeOptions.forEach(riskRadio => {
        riskRadio.checked = false
        overrideYes.checked = false
        overrideYesCc.checked = false
      })
      swRiskTypeOptionsCc.forEach(riskRadio => {
        riskRadio.checked = false
        overrideYes.checked = false
        overrideYesCc.checked = false
      })
    })

    // This checks the initial values and selects them for the risk overrides.
    if (riskType[index] === 'Surface water') {
      swRadio.checked = true

      const overrideValue = feature.properties.riskOverride
      const overrideValueCc = feature.properties.riskOverrideCc

      swOverrideRadiosContainer.classList.remove('hide')

      const handleCcOverride = () => {
        // Show surface water climate change override options
        swOverrideRadiosContainerCc.classList.remove('hide')

        if (overrideValueCc === DoNotOverride) {
          const ccRadio = document.getElementById(`map_${index}-no-override_cc`)
          if (ccRadio) {
            ccRadio.checked = true
          }
          return
        }

        if (overrideValueCc) {
          const ccRadio = document.getElementById(`map_${index}-override_cc`)
          if (ccRadio) {
            ccRadio.checked = true
          }
          return
        }
        console.warn(`Unexpected overrideValueCc: ${overrideValueCc}`)
      }

      const handleOverride = () => {
        radio = document.getElementById(`map_${index}-override`)
        if (radio) {
          radio.checked = true
        }

        swRiskValueContainer.classList.remove('hide')
        swRiskTypeOptions.forEach(option => {
          if (option.getAttribute('value') === overrideValue) {
            option.checked = true
          }
        })
      }

      if (overrideValue === DoNotOverride) {
        radio = document.getElementById(`map_${index}-no-override`)
        if (radio) {
          radio.checked = true
        }
        handleCcOverride()
      } else if (overrideValue) {
        handleOverride()
      } else {
        console.warn(`Unexpected overrideValueCc: ${overrideValue}`)
      }
      updateOverrideWarnings(index)
    } else if (riskType[index] === 'Rivers and the sea') {
      rsRadio.checked = true

      const overrideValueRS = feature.properties.riskOverrideRS
      const overrideValueRSCC = feature.properties.riskOverrideRSCC

      rsOverrideRadiosContainer.classList.remove('hide')

      const handleCcOverride = () => {
        // Show rivers and the sea climate change override options
        rsOverrideRadiosContainerCc.classList.remove('hide')

        if (overrideValueRSCC === DoNotOverride) {
          const radio = document.getElementById(`map_${index}-no-override_rscc`)
          if (radio) {
            radio.checked = true
          }
          return
        }

        if (overrideValueRSCC) {
          const radio = document.getElementById(`map_${index}-override_rscc`)
          if (radio) {
            radio.checked = true
          }
          return
        }
        console.warn(`Unexpected overrideValueCc: ${overrideValueRSCC}`)
      }

      const handleOverride = () => {
        radio = document.getElementById(`map_${index}-override_rs`)
        if (radio) {
          radio.checked = true
        }

        rsRiskValueContainer.classList.remove('hide')
        rsRiskTypeOptions.forEach(option => {
          if (option.getAttribute('value') === overrideValueRS) {
            option.checked = true
          }
        })
      }

      if (overrideValueRS === DoNotOverride) {
        radio = document.getElementById(`map_${index}-no-override_rs`)
        if (radio) {
          radio.checked = true
        }
        handleCcOverride()
      } else if (overrideValueRS) {
        handleOverride()
      } else {
        console.warn(`Unexpected overrideValueCc: ${overrideValueRS}`)
      }
      updateOverrideWarnings(index)
    } else {
      console.warn(`Unexpected riskType: ${riskType[index]}`)
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
