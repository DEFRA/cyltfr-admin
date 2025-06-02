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
    if (!isHoldingComment) {
      const riskReportRadios = document.getElementsByClassName(`risk-report_${index}`)
      for (const radio of riskReportRadios) {
        radio.checked = (radio.value === selectedRadio[index])
      }
      return
    }

    const overrideRadio = document.getElementById(`map_${index}-override`)
    const overrideRadioCc = document.getElementById(`map_${index}-override_cc`)
    const riskOptionRadios = document.getElementById(`risk-options_${index}`)
    const riskOptionRadiosCc = document.getElementById(`risk-options_${index}_cc`)
    const riskRadios = document.getElementsByClassName(`risk-option_${index}`)
    const riskRadiosCc = document.getElementsByClassName(`risk-option_${index}_cc`)
    const riskOverrideRadios = document.getElementById(`risk-override-radios_${index}`)
    const riskOverrideRadiosCc = document.getElementById(`risk-override-radios_${index}_cc`)
    const swRadio = document.getElementById(`sw_${index}`)
    const swRadioCc = document.getElementById(`swcc_${index}`)
    const rsRadio = document.getElementById(`rs_${index}`)
    const riskTypes = document.getElementsByClassName(`risk-type-${index}`)
    const textCommentRadios = document.getElementsByClassName(`textComment_radio_${index}`)
    const noOverrideRadio = document.getElementById(`map_${index}-no-override`)
    const noOverrideRadioCc = document.getElementById(`map_${index}-no-override_cc`)

    setInitialRadioOptions()
    checkRiskOverride()
    document.getElementById(`features_${index}_properties_risk_type`).addEventListener('change', checkRiskOverride)

    overrideRadio.addEventListener('click', function () {
      noOverrideRadio.checked = false
      riskOptionRadios.style.display = 'block'
    })
    noOverrideRadio.addEventListener('click', function () {
      overrideRadio.checked = false
      riskOptionRadios.style.display = 'none'
    })
    overrideRadioCc.addEventListener('click', function () {
      noOverrideRadioCc.checked = false
      riskOptionRadiosCc.style.display = 'block'
    })
    noOverrideRadioCc.addEventListener('click', function () {
      overrideRadioCc.checked = false
      riskOptionRadiosCc.style.display = 'none'
    })

    
    const setInitialRadioOptions = () => {
      for (const typeRadio of riskTypes) {
        typeRadio.checked = (typeRadio.value === riskType[index])
      }
      
      for (const radio of riskRadios) {
        if (swRadio.checked && radio.value === selectedRadio[index]) {
          riskOptionRadios.style.display = 'block'
          overrideRadio.checked = true
          radio.checked = true
        }
      }
      for (const radio of riskRadiosCc) {
        if (swRadioCc.checked && radio.value === selectedRadio[index]) {
          riskOptionRadiosCc.style.display = 'block'
          overrideRadioCc.checked = true
          radio.checked = true
        }
      }
      if (overrideRadio.checked) {
        riskOptionRadios.style.display = 'block'
        riskOptionRadiosCc.style.display = 'none'
      }
      if (overrideRadioCc.checked) {
        riskOptionRadiosCc.style.display = 'block'
        riskOptionRadios.style.display = 'none'
      }
      for (const commentRadio of textCommentRadios) {
        if (commentRadio.value === textCommentRadio[index]) {
          commentRadio.checked = true
        }
      }
    }
    
    const checkTextArea = () => {
      document.getElementById(`text_area_${index}`).style.display = document.getElementById(`text_no_${index}`).checked ? 'none' : 'block'
    }
    const checkRiskOverride = () => {
      if (swRadio.checked) {
        riskOverrideRadios.classList.remove('hide')
        riskOverrideRadiosCc.classList.add('hide')
      }
      if (swRadioCc.checked) {
        riskOverrideRadios.classList.add('hide')
        riskOverrideRadiosCc.classList.remove('hide')
      }
      if (rsRadio.checked) {
        riskOverrideRadios.classList.add('hide')
        riskOverrideRadiosCc.classList.add('hide')
      }
    }
    checkTextArea()
    document.getElementById(`features_${index}_properties_add_comment`).addEventListener('change', checkTextArea)
  }
}
window.LTFMGMT.sharedFunctions = sharedFunctions
