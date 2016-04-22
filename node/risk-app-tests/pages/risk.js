module.exports = {
  elements: {
    'main': '#risk-page',
    'section': '#risk-page .risk',
    'orderedList': '#risk-page ol.list-number'
  },
  commands: [{
    getStatus: function (callback) {
      this.getAttribute('@main', 'data-test-info', function (result) {
        callback(result.value)
      })
    },
    loadPageWithAddress: function (addressId) {
      var url = this.api.launchUrl + '/risk?address=' + addressId
      return this.api.url(url)
    }
  }]
}
