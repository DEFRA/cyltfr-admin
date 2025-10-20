const util = require('util')
const jsonexport = require('jsonexport')
const config = require('../config')
const toCSV = util.promisify(jsonexport)

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
            riskOverride,
            riskOverrideCc,
            riskOverrideRS,
            riskOverrideRSCC
          } = feature.properties

          let RiskOverride = ''
          let RiskOverrideClimateChange = ''

          if (comment.type === 'holding') {
            if (riskType === 'Surface water') {
              RiskOverride = riskOverride || ''
              RiskOverrideClimateChange = riskOverrideCc || ''
            } else if (riskType === 'Rivers and the sea') {
              RiskOverride = riskOverrideRS || ''
              RiskOverrideClimateChange = riskOverrideRSCC || ''
            } else {
              RiskOverride = 'risk type not selected'
              RiskOverrideClimateChange = 'risk type not selected'
            }
          }

          return {
            ...comment,
            start,
            end,
            info,
            FloodRiskType: riskType,
            RiskOverride,
            RiskOverrideClimateChange,
            url: `${baseUrl}/comment/view/${comment.id}`
          }
        })
      })

    const csv = await toCSV(rows.flat())

    return h.response(csv).type('text/csv')
  }
}
