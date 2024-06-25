/*
* Add an `onPreResponse` listener to return error pages
*/
const STATUS_CODES = require('http2').constants

module.exports = {
  plugin: {
    name: 'error-pages',
    register: (server, options) => {
      server.ext('onPreResponse', (request, h) => {
        const response = request.response

        if (response.isBoom) {
          // An error was raised during
          // processing the request
          const statusCode = response.output.statusCode
          const useErrorPages = request.route.settings.app.useErrorPages !== false

          if (useErrorPages) {
            // In the event of 401
            // return the `401` view
            if (statusCode === STATUS_CODES.HTTP_STATUS_UNAUTHORIZED) {
              return h.view('401').code(STATUS_CODES.HTTP_STATUS_OK)
            }

            // In the event of 403
            // return the `403` view
            if (statusCode === STATUS_CODES.HTTP_STATUS_FORBIDDEN) {
              return h.view('403').code(STATUS_CODES.HTTP_STATUS_OK)
            }

            // In the event of 404
            // return the `404` view
            if (statusCode === STATUS_CODES.HTTP_STATUS_NOT_FOUND) {
              return h.view('404').code(STATUS_CODES.HTTP_STATUS_OK)
            }
          }

          request.log('error', {
            statusCode,
            data: response.data,
            message: response.message
          })

          if (useErrorPages) {
            // The return the `500` view
            return h.view('500').code(STATUS_CODES.HTTP_STATUS_OK)
          }
        }

        return h.continue
      })
    }
  }
}
