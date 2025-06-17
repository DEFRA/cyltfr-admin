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

    const setInitialRadioOptions = (radioType, checkedOption, optionsToShow) => { 
      for (const radio of radioType) {
        if (checkedOption.value.includes('climate change') && radio.value === selectedRadio[index]) {
          optionsToShow.classList.remove('hide')
          overrideRadioCc.checked = true
          radio.checked = true
          overrideRadio.checked = false
        } else {
          optionsToShow.classList.remove('hide')
          overrideRadio.checked = true
          radio.checked = true
        }
      }
    }
    if (overrideRadio.checked) {
      riskOptionRadios.classList.remove('hide')
      riskOptionRadiosCc.classList.add('hide')
    }
    if (overrideRadioCc.checked) {
      riskOptionRadiosCc.classList.remove('hide')
      riskOptionRadios.classList.add('hide')
    }

    const checkRiskOverride = () => {
      if (swRadio.checked) {
        riskOverrideRadios.classList.remove('hide')
        riskOverrideRadiosCc.classList.add('hide')
      }
      if (swRadioCc.checked) {
        overrideRadio.checked = false
        riskOverrideRadios.classList.add('hide')
        riskOverrideRadiosCc.classList.remove('hide')
      }
      if (rsRadio.checked) {
        riskOverrideRadios.classList.add('hide')
        riskOverrideRadiosCc.classList.add('hide')
      }
    }
    
    for (const commentRadio of textCommentRadios) {
      if (commentRadio.value === textCommentRadio[index]) {
        commentRadio.checked = true
      }
    }

    const radioType = swRadio.checked ? riskRadios : riskRadiosCc
    const checkedOption = swRadio.checked ? swRadio : swRadioCc
    const optionsToShow = swRadio.checked ? riskOptionRadios : riskOptionRadiosCc
    setInitialRadioOptions(radioType, checkedOption, optionsToShow)
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
    overrideRadioCc.addEventListener('click', function () {
      noOverrideRadioCc.checked = false
      riskOptionRadiosCc.classList.remove('hide')
    })
    noOverrideRadioCc.addEventListener('click', function () {
      overrideRadioCc.checked = false
      riskOptionRadiosCc.classList.add('hide')
    })
    
    const checkTextArea = () => {
      document.getElementById(`text_area_${index}`).style.display = document.getElementById(`text_no_${index}`).checked ? 'none' : 'block'
    }

    checkTextArea()

    document.getElementById(`features_${index}_properties_add_comment`).addEventListener('change', checkTextArea)
  }
}
window.LTFMGMT.sharedFunctions = sharedFunctions
