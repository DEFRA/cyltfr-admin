const { formatDate } = require('../helpers')
const { DATETIMEFORMAT, DATEFORMAT } = require('../constants')

function commentView (comment, geometry, auth, capabilities) {
  const retval = {
    comment,
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

  retval.viewCommentData = {
    head: [
      { text: comment.type === 'holding' ? 'Info' : 'Report' },
      { text: comment.type === 'holding' ? 'Risk Override' : '' },
      { text: 'Valid from' },
      { text: 'Valid to' },
      { text: '' }
    ],
    rows: geometry.features.map((f, i) => ([
      { text: f.properties.info },
      { text: comment.type === 'holding' ? f.properties.riskOverride : '' },
      { text: formatDate(f.properties.start, DATEFORMAT) },
      { text: formatDate(f.properties.end, DATEFORMAT) },
      { html: `<div id='map_${i}' class='comment-map'></div>` }
    ]))
  }

  return retval
}

module.exports = commentView
