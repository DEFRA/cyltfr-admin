const util = require('util')
const jsonexport = require('jsonexport')
const config = require('../config')
const toCSV = util.promisify(jsonexport)

function getRiskOverrides(comment, riskType, properties) {
  const {
    riskOverride,
    riskOverrideCc,
    riskOverrideRS,
    riskOverrideRSCC
  } = properties

  const notApplicable = {
    riskOverridePresentDay: 'Not applicable',
    riskOverrideClimateChange: 'Not applicable'
  }

  if (comment.type !== 'holding') {
    return notApplicable
  }

  if (riskType === 'Surface water') {
    const presentDay = riskOverride || ''
    const climateChange = presentDay && presentDay !== 'Do not override'
      ? 'Override'
      : riskOverrideCc || ''
    return {
      riskOverridePresentDay: presentDay,
      riskOverrideClimateChange: climateChange
    }
  }

  if (riskType === 'Rivers and the sea') {
    const presentDay = riskOverrideRS || ''
    const climateChange = presentDay && presentDay !== 'Do not override'
      ? 'Override'
      : riskOverrideRSCC || ''
    return {
      riskOverridePresentDay: presentDay,
      riskOverrideClimateChange: climateChange
    }
  }

  return notApplicable
}

module.exports = {
  method: 'GET',
  path: '/comments.csv',
  handler: async (request, h) => {
    const { auth, provider } = request

    const comments = await provider.getFile()
    const homeComments = auth.credentials.isApprover
      ? comments
      : comments.filter(c => c.createdBy === auth.credentials.profile.email)

    const files = await Promise
      .all(homeComments
        .map(c => provider.getFile(`${config.holdingCommentsPrefix}/${c.keyname}`)))

    const baseUrl = request.url.origin
    const rows = homeComments
      .map((comment, i) => {
        return files[i].features.map(feature => {
          const {
            start,
            end,
            info,
            riskType,
          } = feature.properties

          const { riskOverridePresentDay, riskOverrideClimateChange } =
            getRiskOverrides(comment, riskType, feature.properties)

          //Fix to remove the additional riskType field
          const { riskType: _, ...commentWithoutRisk } = comment

          return {
            ...commentWithoutRisk,
            start,
            end,
            info,
            'risk type': riskType,
            'present day override': riskOverridePresentDay,
            'climate change override': riskOverrideClimateChange,
            url: `${baseUrl}/comment/view/${comment.id}`
          }
        })
      })

    const csv = await toCSV(rows.flat())

    return h.response(csv).type('text/csv')
  }
}
