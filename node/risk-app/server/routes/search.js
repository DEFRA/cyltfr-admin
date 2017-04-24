var Joi = require('joi')
var Boom = require('boom')
var addressService = require('../services/address')
var SearchViewModel = require('../models/search-view')
var errors = require('../models/errors.json')

module.exports = {
  method: 'GET',
  path: '/search',
  config: {
    description: 'Get postcode search results',
    handler: function (request, reply) {
      var postcode = request.query.postcode
      var validPostcode = postcode.toUpperCase().replace(' ', '')
      var postcodeRegex = /[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}/gi

      if (!postcodeRegex.test(postcode)) {
        return reply.redirect('/?err=postcode')
      }

      addressService.findByPostcode(validPostcode, function (err, addresses) {
        if (err) {
          return reply(Boom.badRequest(errors.addressByPostcode.message, err))
        }

        if (!addresses || !addresses.length) {
          return reply.redirect('/?err=postcode')
        }

        reply.view('search', new SearchViewModel(postcode, addresses))
      })
    },
    validate: {
      query: {
        postcode: Joi.string().required().allow('')
      }
    }
  }
}