module.exports = {
  method: 'GET',
  path: '/status',
  handler: async (_request, _h) => {
    return 'ok'
  },
  options: {
    auth: false
  }
}
