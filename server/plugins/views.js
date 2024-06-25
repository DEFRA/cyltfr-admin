const path = require('path')
const nunjucks = require('nunjucks')
const config = require('../config')
const { formatDate } = require('../helpers')
const pkg = require('../../package.json')
const analyticsAccount = config.analyticsAccount

module.exports = {
  plugin: require('@hapi/vision'),
  options: {
    engines: {
      html: {
        compile: (src, options) => {
          const template = nunjucks.compile(src, options.environment)

          return (context) => {
            return template.render(context)
          }
        },
        prepare: (options, next) => {
          const env = nunjucks.configure([
            path.join(options.relativeTo || process.cwd(), options.path),
            'node_modules/govuk-frontend/dist/govuk/',
            'node_modules/govuk-frontend/dist/govuk/components/'
          ], {
            autoescape: true,
            watch: false
          })

          env.addFilter('formatDate', function (date, format) {
            return formatDate(date, format)
          })

          options.compileOptions.environment = env

          return next()
        }
      }
    },
    path: '../views',
    relativeTo: __dirname,
    isCached: !config.isDev,
    context: {
      appStage: config.env,
      appVersion: pkg.version,
      assetPath: '/assets',
      serviceRef: 'LTF-Admin',
      serviceName: 'LTFRI Admin Console',
      pageTitle: 'LTFRI Admin Console - EA.GOV.UK',
      analyticsAccount
    }
  }
}
