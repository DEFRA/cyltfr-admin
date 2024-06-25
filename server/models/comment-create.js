const errorMessages = {
  description: 'Enter a description',
  start: 'Enter a valid start date',
  end: 'Enter a valid end date',
  info: 'Enter a holding comment',
  geometry: 'Enter a valid geometry file'
}

function mapErrors (errors) {
  const map = {}

  errors.forEach(error => {
    const contextKey = error.path[0]
    map[contextKey] = {
      text: errorMessages[contextKey]
    }
  })

  return map
}

function commentCreate (type, capabilities, data, err) {
  const retval = {
    type,
    data,
    capabilities
  }
  if (err) {
    retval.errors = mapErrors(err.details)
  }
  return retval
}

module.exports = commentCreate
