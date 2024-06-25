class CreateCommentPage {
  constructor (window) {
    this.window = window
    this.document = window.document
    this.FormData = window.FormData
    this.fetch = window.fetch
    this.commentMap = window.LTFMGMT.commentMap
    this.capabilities = window.LTFMGMT.capabilities
    this.type = window.LTFMGMT.type
    this.isHoldingComment = this.type === 'holding'
    this.document.getElementById('geometry').addEventListener('change', this.fileChange)
  }

  showErrorMessage (message) {
    const messageBox = this.document.getElementById('error-message')
    const messageText = this.document.getElementById('error-message-text')

    messageText.textContent = message
    messageBox.style.display = 'block'
    this.document.getElementById('spinner').style.display = 'none'
    this.document.getElementById('geometry').style.display = 'block'
  }

  fileChange = async (event) => {
  // Read file and add to form data fields
    if (!event.target.files?.length) {
      return
    }

    const formData = new FormData()

    formData.append('geometry', event.target.files[0])

    event.target.style.display = 'none'
    document.getElementById('spinner').style.display = 'inline'

    let jsonFileData
    try {
    // Process data using the shp2json router
      jsonFileData = await this.getJsonFileData(formData)
    } catch (error) {
      this.showErrorMessage('Invalid shapefile: ' + error.message)
      return
    }

    // Add feature sections for each feature
    const featureForm = document.getElementById('features')

    jsonFileData.features.forEach((_feature, index) => {
      featureForm.insertAdjacentHTML('beforeend', window.LTFMGMT.addFeatureHtml(index, this.type))
    })

    document.querySelectorAll('.comment-map').forEach((div, index) => {
      div.id = 'map_' + index
    })
    document.getElementById('data_name').setAttribute('value', `${jsonFileData.name}`)
    document.getElementById('file').remove()
    document.getElementById('comment-form').style.display = 'block'

    const featureTextAreas = document.querySelectorAll('.govuk-textarea')
    const startDateField = document.querySelectorAll('.start-date')
    const endDateField = document.querySelectorAll('.end-date')

    jsonFileData.features.forEach((feature, index, features) => {
      const geo = {
        ...jsonFileData,
        features: features.filter(f => f === feature)
      }
      startDateField[index].value = `${feature.properties.start}`
      endDateField[index].value = `${feature.properties.end}`

      if (this.isHoldingComment) {
        featureTextAreas[index].value = `${feature.properties.info}`
      }
      window.LTFMGMT.sharedFunctions.setInitialValues(index, this.isHoldingComment)
      this.commentMap(geo, 'map_' + index, this.capabilities)
    })

    if (jsonFileData.features.length > 1) {
      this.commentMap(jsonFileData, 'map', this.capabilities, 'The map below shows all geometries contained within the shapefile')
    }

    // Add char count for the text areas
    window.LTFMGMT.sharedFunctions.addCharacterCounts()

    document.getElementById('comment-form').addEventListener('submit', async (e) => {
      try {
        this.updateDataToBeSubmitted(e, jsonFileData, this.isHoldingComment)

        const response = await fetch('/comment/create/' + this.type, {
          method: 'post',
          body: JSON.stringify(jsonFileData),
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        })
        if (response.ok) {
          window.location.href = '/'
        } else {
          throw new Error(response.statusText)
        }
      } catch (error) {
        console.error(error)
        this.showErrorMessage('Save failed')
      }
    })
  }

  updateDataToBeSubmitted = (event, jsonFileData, isHoldingComment) => {
    event.preventDefault()
    const eventFormData = new FormData(event.target)

    const boundaryValue = eventFormData.get('boundary')
    jsonFileData.boundary = boundaryValue
    if (jsonFileData.name !== eventFormData.get('name')) {
      jsonFileData.name = eventFormData.get('name')
    }

    jsonFileData.features.forEach(function (feature, index) {
      const riskTypeValue = eventFormData.get(`sw_or_rs_${index}`)
      const riskOverrideValue = eventFormData.get(`override_${index}-risk`)
      const riskReportType = eventFormData.get(`features_${index}_properties_report_type`)
      const addCommentRadio = eventFormData.get(`add_holding_comment_${index}`)

      if (feature.properties.end !== eventFormData.get(`features_${index}_properties_end`)) {
        feature.properties.end = eventFormData.get(`features_${index}_properties_end`)
      }
      if (feature.properties.start !== eventFormData.get(`features_${index}_properties_start`)) {
        feature.properties.start = eventFormData.get(`features_${index}_properties_start`)
      }

      if (isHoldingComment) {
        feature.properties.riskType = riskTypeValue
        if (feature.properties.info !== eventFormData.get(`features_${index}_properties_info`)) {
          feature.properties.info = eventFormData.get(`features_${index}_properties_info`)
        }
        if (riskTypeValue === 'Surface water') {
          feature.properties.riskOverride = riskOverrideValue
        }
        if (addCommentRadio === 'No') {
          feature.properties.commentText = 'No'
          feature.properties.info = ''
        } else {
          feature.properties.commentText = 'Yes'
        }
      } else {
        feature.properties.info = riskReportType
      }
    })
  }

  getJsonFileData = async (formData) => {
    const response = await fetch('/shp2json/' + this.type, {
      method: 'post',
      body: formData
    })
    if (!response.ok) {
      const result = await response.json()
      throw new Error(result.message)
    }
    const jsonFileData = await response.json()
    return jsonFileData
  }
}

window.LTFMGMT.createCommentPage = new CreateCommentPage(window)
