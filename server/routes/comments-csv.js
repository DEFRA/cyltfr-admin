const util = require('util')
const jsonexport = require('jsonexport')
const config = require('../config')
const toCSV = util.promisify(jsonexport)

function getRiskOverrides (comment, riskType, properties) {
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

  const getOverrides = (presentDayOverride, climateChangeOverride) => {
    const presentDay = presentDayOverride || ''
    const climateChange = presentDay && presentDay !== 'Do not override'
      ? 'Override'
      : climateChangeOverride || ''
    return {
      riskOverridePresentDay: presentDay,
      riskOverrideClimateChange: climateChange
    }
  }

  switch (riskType) {
    case 'Surface water':
      return getOverrides(riskOverride, riskOverrideCc)
    case 'Rivers and the sea':
      return getOverrides(riskOverrideRS, riskOverrideRSCC)
    default:
      return notApplicable
  }
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

          // Fix to remove the additional riskType field
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
