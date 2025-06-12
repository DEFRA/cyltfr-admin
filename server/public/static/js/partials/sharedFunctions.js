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
    const overrideRadioRS = document.getElementById(`map_${index}-override_rs`)
    const riskOptionRadios = document.getElementById(`risk-options_${index}`)
    const riskOptionRadiosRS = document.getElementById(`risk-options_${index}_rs`)
    const riskRadios = document.getElementsByClassName(`risk-option_${index}`)
    const riskRadiosRS = document.getElementsByClassName(`risk-option_${index}_rs`)
    const riskOverrideRadios = document.getElementById(`risk-override-radios_${index}`)
    const riskOverrideRadiosRS = document.getElementById(`risk-override-radios_${index}_rs`)
    const swRadio = document.getElementById(`sw_${index}`)
    const rsRadio = document.getElementById(`rs_${index}`)
    const riskTypes = document.getElementsByClassName(`risk-type-${index}`)
    const textCommentRadios = document.getElementsByClassName(`textComment_radio_${index}`)
    const noOverrideRadio = document.getElementById(`map_${index}-no-override`)
    const noOverrideRadioRS = document.getElementById(`map_${index}-no-override_rs`)

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
        if (checkedOption && radio.value === selectedRadio[index]) {
          optionsToShow.style.display = 'block'
          overrideRadio.checked = true
          radio.checked = true
        }
      }
    }
    if (overrideRadio.checked) {
      riskOptionRadios.classList.remove('hide')
      riskOptionRadiosRS.classList.add('hide')
    } else if (noOverrideRadio.checked) {
      riskOptionRadios.classList.add('hide')
    }
    
    if (overrideRadioRS.checked) {
      riskOptionRadiosRS.classList.remove('hide')
      riskOptionRadios.classList.add('hide')
    } else if (noOverrideRadioRS.checked) {
      riskOptionRadiosRS.classList.add('hide')
    }

    const checkRiskOverride = () => {
      if (swRadio.checked) {
        riskOverrideRadios.classList.remove('hide')
        riskOverrideRadiosRS.classList.add('hide')
      }
      if (rsRadio.checked) {
        riskOverrideRadios.classList.add('hide')
        riskOverrideRadiosRS.classList.remove('hide')
      }
    }
    
    for (const commentRadio of textCommentRadios) {
      if (commentRadio.value === textCommentRadio[index]) {
        commentRadio.checked = true
      }
    }

    const radioType = swRadio.checked ? riskRadios : riskRadiosRS
    const checkedOption = swRadio.checked ? swRadio : rsRadio
    const optionsToShow = swRadio.checked ? riskOptionRadios : riskOptionRadiosRS
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
    overrideRadioRS.addEventListener('click', function () {
      noOverrideRadioRS.checked = false
      riskOptionRadiosRS.classList.remove('hide')
    })
    noOverrideRadioRS.addEventListener('click', function () {
      overrideRadioRS.checked = false
      riskOptionRadiosRS.classList.add('hide')
    })
    
    const checkTextArea = () => {
      document.getElementById(`text_area_${index}`).style.display = document.getElementById(`text_no_${index}`).checked ? 'none' : 'block'
    }

    checkTextArea()

    document.getElementById(`features_${index}_properties_add_comment`).addEventListener('change', checkTextArea)
  }
}
window.LTFMGMT.sharedFunctions = sharedFunctions
