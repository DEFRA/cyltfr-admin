const { DATETIMEFORMAT } = require('../constants')

const escapeHtml = (value) => {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

async function homeView (comments, currentUser) {
  const { formatDate } = await import('../helpers.mjs')
  const defaultMapper = (field, row) => ({
    text: row[field.name] || ''
  })

  const approvedMapper = (_field, row) => {
    const { approvedAt, approvedBy } = row

    if (!approvedAt) {
      return null
    }

    return {
      html: `<span class="govuk-tag govuk-tag--green" title="Approved by ${escapeHtml(approvedBy)} at ${formatDate(approvedAt, DATETIMEFORMAT)}">Approved</span>`,
      attributes: { style: 'text-align: center;', 'data-sort': approvedAt }
    }
  }

  const fields = [
    {
      name: 'description',
      title: 'Description',
      mapper: (_field, row) => ({
        html: `<a href="/comment/view/${encodeURIComponent(row.id || '')}" class="home-page-table description-column">${escapeHtml(row.description)}</a>`
      })
    },
    {
      name: 'riskType',
      title: 'Flood Risk',
      mapper: (_field, row) => ({
        html: `<span class="home-page-table flood-risk-column">${escapeHtml(row[_field.name])}</span>`
      })
    },
    {
      name: 'type',
      title: 'Type',
      mapper: (field, row) => ({
        text: row[field.name] === 'holding' ? 'Holding' : 'LLFA'
      })
    },
    {
      name: 'createdBy',
      title: 'Created By',
      mapper: (field, row) => ({
        html: `<span class="home-page-table created-by-column">${escapeHtml(row[field.name])}</span>`
      })
    },
    { name: 'featureCount', title: 'Features' },
    { name: 'boundary', title: 'Boundary' },
    { name: 'approvedAt', title: 'Approved', mapper: approvedMapper }
  ]

  const head = fields.map(f => ({
    text: f.title
  }))

  // Sort comments so that those created by the current user are at the top
  const sortedComments = comments.sort((commentA, commentB) => {
    if (commentA.createdBy === currentUser && commentB.createdBy !== currentUser) {
      return -1
    }
    if (commentA.createdBy !== currentUser && commentB.createdBy === currentUser) {
      return 1
    }
    return 0
  })

  const rows = sortedComments.map(commentObject => {
    return fields.map(field => field.mapper ? field.mapper(field, commentObject) : defaultMapper(field, commentObject))
  })

  return {
    table: {
      head,
      rows
    },
    comments: sortedComments,
    commentGuidance: 'partials/comment-guidance.html'
  }
}

module.exports = homeView
