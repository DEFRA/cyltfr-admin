const { formatDate } = require('../helpers')
const { DATETIMEFORMAT, DATEFORMAT } = require('../constants')

function commentView (comment, geometry, auth, capabilities) {
  const retval = {
    comment,
    commentGuidance: 'partials/comment-guidance.html',
    geometry,
    capabilities,
    isApprover: auth.credentials.isApprover,
    allowDelete: auth.credentials.isApprover ||
    comment.createdBy === auth.credentials.profile.email
  }

  retval.viewHeaderData = {
    firstCellIsHeader: true,
    rows: [
      [{ text: 'Description' }, { text: comment.description }],
      [{ text: 'Boundary' }, { text: comment.boundary }],
      [{ text: 'Type' }, { text: comment.type === 'holding' ? 'Holding' : 'LLFA' }],
      [{ text: 'Created at' }, { text: formatDate(comment.createdAt, DATETIMEFORMAT) }],
      [{ text: 'Created by' }, { text: comment.createdBy }],
      [{ text: 'Updated at' }, { text: formatDate(comment.updatedAt, DATETIMEFORMAT) }],
      [{ text: 'Updated by' }, { text: comment.updatedBy }],
      [{ text: 'Approved at' }, { text: comment.approvedAt && formatDate(comment.approvedAt, DATETIMEFORMAT) }],
      [{ text: 'Approved by' }, { text: comment.approvedBy }]
    ]
  }

  if (comment.lastError) {
    const timestamp = formatDate(comment.lastError.timestamp, DATETIMEFORMAT)

    retval.viewHeaderData.rows.push([
      { text: 'Last error' },
      { text: `${comment.lastError.message} ${timestamp}` }
    ])
  }

  retval.viewFeatureData = geometry.features.map((f, i) => {
    const doNotOverride = 'Do not override'
    let presentDay = f.properties.riskOverride ?? f.properties.riskOverrideRS
    // This assigns the 'Do not override' value to legacy comments where a risk override was not applied.
    if (presentDay === null || presentDay === undefined) { presentDay = doNotOverride }

    let climateChange = f.properties.riskOverrideCc ?? f.properties.riskOverrideRSCC
    // This assigns the 'Do not override' value for climate change to legacy comments where a risk override was not applied.
    if (climateChange === null || climateChange === undefined) { climateChange = doNotOverride }

    if ((presentDay && presentDay !== doNotOverride) || climateChange === 'Override') {
      climateChange = 'No data available'
    }

    const commentData = {
      firstCellIsHeader: true,
      rows: [
        [{ text: comment.type === 'holding' ? 'Info' : 'Report' }, { text: f.properties.info }],
        [{ text: comment.type === 'holding' ? 'Present day risk override' : '', classes: 'header-column' }, { text: presentDay }],
        [{ text: comment.type === 'holding' ? 'Climate change risk override' : '', classes: 'header-column' }, { text: climateChange }],
        [{ text: 'Valid from' }, { text: formatDate(f.properties.start, DATEFORMAT) }],
        [{ text: 'Valid to', classes: 'no-border' }, { text: formatDate(f.properties.end, DATEFORMAT), classes: 'no-border' }]
      ]
    }

    let mapHtml = `<div id='map_${i}' class='comment-map-view'></div>
                  <button class="govuk-button enlarge-map-button" onclick="openMapModal(${i})">View larger map</button>`

    if (retval.allowDelete) {
      mapHtml += '<div class="delete-entry"> ' +
                `<form method="POST" action="/comment/edit/${comment.id}/deletesingle/${i}"` +
                'onsubmit="return confirm(\'Are you sure you want to delete this comment?\')">' +
                '<button class="govuk-button govuk-button--warning" type="submit">Delete entry</button>' +
                '</form></div>'
    }

    const mapData = {
      firstCellIsHeader: false,
      rows: [[{ html: mapHtml, classes: 'no-border' }]]
    }

    return { commentData, mapData }
  })

  return retval
}

module.exports = commentView
