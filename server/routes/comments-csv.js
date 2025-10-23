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

          let riskOverridePresentDay = ''
          let riskOverrideClimateChange = ''

          if (comment.type === 'holding') {
            if (riskType === 'Surface water') {
              riskOverridePresentDay = riskOverride || ''
              if (riskOverridePresentDay && riskOverridePresentDay !== 'Do not override') {
                riskOverrideClimateChange = 'Override'
              } else {
                riskOverrideClimateChange = riskOverrideCc || ''
              }
            } else if (riskType === 'Rivers and the sea') {
              riskOverridePresentDay = riskOverrideRS || ''
              if (riskOverridePresentDay && riskOverridePresentDay !== 'Do not override') {
                riskOverrideClimateChange = 'Override'
              } else {
                riskOverrideClimateChange = riskOverrideRSCC || ''
              }
            } else {
              riskOverridePresentDay = 'No risk type selected'
              riskOverrideClimateChange = 'No risk type selected'
            }
          }

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
