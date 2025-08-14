const sharedFunctions = {
  addCharacterCounts: () => {
    const textareas = document.querySelectorAll('textarea')
    const remainingCharsTexts = document.querySelectorAll('.remaining-chars-text')

    textareas.forEach((textarea, index) => {
      updateRemainingChars(textarea, remainingCharsTexts[index])
      textarea.addEventListener('input', () => {
        updateRemainingChars(textarea, remainingCharsTexts[index])
      })
    })

    function updateRemainingChars (textarea, remainingCharsText) {
      const maxLength = parseInt(textarea.getAttribute('maxLength'))
      remainingCharsText.innerHTML = maxLength - textarea.value.length
    }
  },

  setInitialValues: (index, isHoldingComment, selectedRadio = [], riskType = [], textCommentRadio = []) => {
    const overrideRadio = document.getElementById(`map_${index}-override`)
    const riskOptionRadios = document.getElementById(`risk-options_${index}`)
    const riskOverrideRadios = document.getElementById(`risk-override-radios_${index}`)
    const riskOverrideRadiosCc = document.getElementById(`risk-override-radios_${index}_cc`)
    const swRadio = document.getElementById(`sw_${index}`)
    const rsRadio = document.getElementById(`rs_${index}`)
    const riskTypes = document.getElementsByClassName(`risk-type-${index}`)
    const textCommentRadios = document.getElementsByClassName(`textComment_radio_${index}`)
    const noOverrideRadio = document.getElementById(`map_${index}-no-override`)
    const overrideRadioCC = document.getElementById(`map_${index}-override_cc`)
    const noOverrideRadioCC = document.getElementById(`map_${index}-no-override_cc`)
    const riskOverrideWarning = document.getElementById(`risk-override-warning_${index}`)
    const riskOverrideWarningCC = document.getElementById(`risk-override-warning_${index}_cc`)

    const overrideRadioRS = document.getElementById(`map_${index}-override_rs`)
    const noOverrideRadioRS = document.getElementById(`map_${index}-no-override_rs`)
    const riskOptionRadiosRS = document.getElementById(`risk-options_${index}_rs`)
    const riskOverrideRadiosRS = document.getElementById(`risk-override-radios_${index}_rs`)
    const riskOverrideRadiosRSCC = document.getElementById(`risk-override-radios_${index}_rscc`)
    const overrideRadioRSCC = document.getElementById(`map_${index}-override_rscc`)
    const noOverrideRadioRSCC = document.getElementById(`map_${index}-no-override_rscc`)
    const riskOverrideWarningRS = document.getElementById(`risk-override-warning_${index}_rs`)
    const riskOverrideWarningRSCC = document.getElementById(`risk-override-warning_${index}_rscc`)

    if (!isHoldingComment) {
      const riskReportRadios = document.getElementsByClassName(`risk-report_${index}`)
      for (const radio of riskReportRadios) {
        radio.checked = (radio.value === selectedRadio[index])
      }
      return
    }

    for (const typeRadio of riskTypes) {
      typeRadio.checked = (typeRadio.value === riskType[index])
    }

    if (overrideRadio.checked) {
      riskOptionRadios.classList.remove('hide')
    }

    const checkRiskOverride = () => {
      if (swRadio.checked) {
        riskOverrideRadios.classList.remove('hide')
        // Show sw climate change override option if present day "No" is selected
        if (noOverrideRadio.checked) {
          riskOverrideRadiosCc.classList.remove('hide')
          riskOverrideWarning.classList.add('hide')
        } else {
          riskOverrideRadiosCc.classList.add('hide')
          riskOverrideWarning.classList.remove('hide')
          riskOptionRadios.classList.remove('hide')
        }
        // Show cc warning if cc override is selected
        if (overrideRadioCC.checked) {
          riskOverrideWarningCC.classList.remove('hide')
        } else {
          riskOverrideWarningCC.classList.add('hide')
        }
        // Hide RS options while SW is selected
        riskOverrideRadiosRS.classList.add('hide')
        riskOverrideRadiosRSCC.classList.add('hide')
        riskOverrideWarningRS.classList.add('hide')
        riskOverrideWarningRSCC.classList.add('hide')
        riskOptionRadiosRS.classList.add('hide')
      } else if (rsRadio.checked) {
        riskOverrideRadiosRS.classList.remove('hide')
        // Show rs climate change override option if present day "No" is selected
        if (noOverrideRadioRS.checked) {
          riskOverrideRadiosRSCC.classList.remove('hide')
          riskOverrideWarningRS.classList.add('hide')
        } else {
          riskOverrideRadiosRSCC.classList.add('hide')
          riskOverrideWarningRS.classList.remove('hide')
          riskOptionRadiosRS.classList.remove('hide')
        }
        // Show cc warning if cc override is selected
        if (overrideRadioRSCC.checked) {
          riskOverrideWarningRSCC.classList.remove('hide')
        } else {
          riskOverrideWarningRSCC.classList.add('hide')
        }
        // Hide SW options while RS is selected
        riskOverrideRadios.classList.add('hide')
        riskOverrideRadiosCc.classList.add('hide')
        riskOverrideWarning.classList.add('hide')
        riskOverrideWarningCC.classList.add('hide')
        riskOptionRadios.classList.add('hide')
      } else {
        riskOverrideRadios.classList.add('hide')
        riskOverrideRadiosCc.classList.add('hide')
        riskOverrideWarning.classList.add('hide')
        riskOverrideWarningCC.classList.add('hide')
        riskOverrideRadiosRS.classList.add('hide')
        riskOverrideRadiosRSCC.classList.add('hide')
        riskOverrideWarningRS.classList.add('hide')
        riskOverrideWarningRSCC.classList.add('hide')
      }
    }

    for (const commentRadio of textCommentRadios) {
      if (commentRadio.value === textCommentRadio[index]) {
        commentRadio.checked = true
      }
    }

    checkRiskOverride()

    document.getElementById(`features_${index}_properties_risk_type`).addEventListener('change', checkRiskOverride)

    overrideRadio.addEventListener('click', function () {
      noOverrideRadio.checked = false
      riskOptionRadios.classList.remove('hide')
    })
    noOverrideRadio.addEventListener('click', function () {
      overrideRadio.checked = false
      riskOptionRadios.classList.add('hide')
    })
    overrideRadioRS.addEventListener('click', function () {
      noOverrideRadioRS.checked = false
      riskOptionRadiosRS.classList.remove('hide')
    })
    noOverrideRadioRS.addEventListener('click', function () {
      overrideRadioRS.checked = false
      riskOptionRadiosRS.classList.add('hide')
    })

    noOverrideRadio.addEventListener('change', checkRiskOverride)
    overrideRadio.addEventListener('change', checkRiskOverride)
    swRadio.addEventListener('change', checkRiskOverride)
    rsRadio.addEventListener('change', checkRiskOverride)
    overrideRadioCC.addEventListener('change', checkRiskOverride)
    noOverrideRadioCC.addEventListener('change', checkRiskOverride)
    overrideRadioRS.addEventListener('change', checkRiskOverride)
    noOverrideRadioRS.addEventListener('change', checkRiskOverride)
    overrideRadioRSCC.addEventListener('change', checkRiskOverride)
    noOverrideRadioRSCC.addEventListener('change', checkRiskOverride)

    const checkTextArea = () => {
      document.getElementById(`text_area_${index}`).style.display = document.getElementById(`text_no_${index}`).checked ? 'none' : 'block'
    }

    checkTextArea()

    document.getElementById(`features_${index}_properties_add_comment`).addEventListener('change', checkTextArea)
  }
}
window.LTFMGMT.sharedFunctions = sharedFunctions
