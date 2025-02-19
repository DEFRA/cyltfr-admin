const { formatDate } = require('../helpers')
const { DATETIMEFORMAT } = require('../constants')

function homeView (comments, currentUser) {
  const defaultMapper = (field, row) => ({
    text: row[field.name] || ''
  })

  const approvedMapper = (_field, row) => {
    const { approvedAt, approvedBy } = row

    if (!approvedAt) {
      return null
    }

    return {
      html: `<span title="Approved by ${approvedBy} at ${formatDate(approvedAt, DATETIMEFORMAT)}">✅</span>`,
      attributes: { style: 'text-align: center;', 'data-sort': approvedAt }
    }
  }

  const fields = [
    {
      name: 'description',
      title: 'Description',
      mapper: (_field, row) => ({
        html: `<a href="/comment/view/${row.id}">${row.description}</a>`
      })
    },
    {
      name: 'riskType',
      title: 'Flood Risk',
      mapper: (_field, row) => ({
        text: row[_field.name] || ''
      })
    },
    {
      name: 'type',
      title: 'Type',
      mapper: (field, row) => ({
        text: row[field.name] === 'holding' ? 'Holding' : 'LLFA'
      })
    },
    { name: 'createdBy', title: 'Created By' },
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
    comments: sortedComments
  }
}

module.exports = homeView
