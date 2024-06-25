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
    const riskOptionRadios = document.getElementById(`risk-options_${index}`)

    const riskRadios = document.getElementsByClassName(`risk-option_${index}`)
    for (const radio of riskRadios) {
      if (radio.value === selectedRadio[index]) {
        riskOptionRadios.style.display = 'block'
        overrideRadio.checked = true
        radio.checked = true
      }
    }

    const riskTypes = document.getElementsByClassName(`risk-type-${index}`)
    for (const typeRadio of riskTypes) {
      typeRadio.checked = (typeRadio.value === riskType[index])
    }

    const textCommentRadios = document.getElementsByClassName(`textComment_radio_${index}`)
    for (const commentRadio of textCommentRadios) {
      if (commentRadio.value === textCommentRadio[index]) {
        commentRadio.checked = true
      }
    }

    if (overrideRadio.checked) {
      riskOptionRadios.style.display = 'block'
    }

    const noOverrideRadio = document.getElementById(`map_${index}-no-override`)
    overrideRadio.addEventListener('click', function () {
      noOverrideRadio.checked = false
      riskOptionRadios.style.display = 'block'
    })
    noOverrideRadio.addEventListener('click', function () {
      overrideRadio.checked = false
      riskOptionRadios.style.display = 'none'
    })

    const checkRiskOverride = () => {
      document.getElementById(`risk-override-radios_${index}`).style.display = document.getElementById(`rs_${index}`).checked ? 'none' : 'block'
    }
    checkRiskOverride()
    document.getElementById(`features_${index}_properties_risk_type`).addEventListener('change', checkRiskOverride)

    const checkTextArea = () => {
      document.getElementById(`text_area_${index}`).style.display = document.getElementById(`text_no_${index}`).checked ? 'none' : 'block'
    }
    checkTextArea()
    document.getElementById(`features_${index}_properties_add_comment`).addEventListener('change', checkTextArea)
  }

}
window.LTFMGMT.sharedFunctions = sharedFunctions
