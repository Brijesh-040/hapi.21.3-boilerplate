'use strict'

// const DEVELOPMENT = 'development'
const PRODUCTION = 'production'

const getArgument = (argument) => {
  return process.argv.indexOf(argument)
}

if (getArgument('--development') !== -1) {
  console.log(">>>>>>>>>>>>>>>>>>>> set devlopment");
  process.env.NODE_ENV = 'development'
}

if (getArgument('--beta') !== -1) {
  console.log(">>>>>>>>>>>>>>>>>>>> set beta");
  process.env.NODE_ENV = 'beta'
}

if (getArgument('--prod') !== -1) {
  console.log(">>>>>>>>>>>>>>>>>>>> set production");
  process.env.NODE_ENV = 'production'
}

if (getArgument('--development') !== -1 || getArgument('--beta') !== -1 || getArgument('--prod') !== -1) {
  process.env.NODE_CONFIG_DIR = `${__dirname}`
}

const config = require('config')
const mongoose = require('mongoose')
const Config = JSON.parse(JSON.stringify(config))

// Remove console log in production mode
if (process.env.NODE_ENV === 'production') {
  console.log('process.env.NODE_ENV: ', process.env.NODE_ENV);
  console.log('process.env.NODE_CONFIG_DIR', process.env.NODE_CONFIG_DIR);
  console.log("DB connection string",process.env.DB);
  console.log = function () {}
}

// REF: https://github.com/z0mt3c/hapi-swaggered ,  https://github.com/z0mt3c/hapi-swaggered-ui
const swaggeredOptions = {
  info: {
    title: require('../package.json').name,
    version: require('../package.json').version,
    description: 'DSC v1'
  },
  basePath: '/api',
  documentationPath: '/docs',
  tags: [],
  grouping: 'tags',
  securityDefinitions: {
    ApiKeyAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header'
    }
  }
}

const DEFAULT = 'default'

let plugins = []
const ENV = config.util.getEnv('NODE_ENV').trim()

if (ENV !== DEFAULT) {
  swaggeredOptions.schemes = ['https', 'http']
  swaggeredOptions.options = 'v1-api.dsc.app'
  swaggeredOptions.host = Config.constants.API_BASEPATH
}

if (ENV === PRODUCTION) {
  mongoose.set('debug', false)
} else {
  mongoose.set('debug', true)
}

if (ENV !== PRODUCTION) {
  plugins = [
    {
      plugin: '@hapi/inert'
    },
    {
      plugin: '@hapi/vision'
    },
    {
      plugin: 'hapi-swagger',
      options: swaggeredOptions
    },
    {
      plugin: 'hapi-dev-errors',
      options: {
        showErrors: process.env.NODE_ENV !== 'production',
        toTerminal: true
      }
    }
  ]
}
plugins = plugins.concat([
  {
    plugin: 'hapi-auth-jwt2'
  },
  {
    plugin: '@hapi/basic'
  },
  {
    plugin: '@hapipal/schmervice'
  },
  {
    plugin: 'mrhorse',
    options: {
      policyDirectory: `${__dirname}/../server/policies`,
      defaultApplyPoint:
        'onPreHandler' /* optional.  Defaults to onPreHandler */
    }
  },
  {
    plugin: '@plugins/mongoose.plugin',
    options: {
      connections: Config.connections
    }
  },
  {
    plugin: '@plugins/logger.plugin',
    options: {
      name: 'om-api',
      logPayload : true,
      logResponse : true,
      logDbQuery : false,
      logType : 'RESPONSE',
      logQueryParams : true,
      logPathParams : true,
      logRouteTags : true,
      log4xxResponseErrors : true,
      ignoreMethods : ['OPTIONS'],
      ignoreLogTypes : ['DBQUERY'],
      timestamp : true,
      redact: {
        paths: Config.constants.log.secret,
        remove: Config.constants.log.needToRemove
      },
      customLevels: {
        iglog: 80
      },
      formatters: {
        level: (label, number) => {
          return {
            level: number,
            label: label.toUpperCase()
          }
        },
        bindings(bindings) {

          return { tags: bindings.tags };
        }
      }
    }
  },
  {
    // if you need authentication then uncomment this plugin, and remove "auth: false" below
    plugin: '@plugins/auth.plugin'
  },
  {
    plugin: '@routes/root.route'
  }
])
// if (ENV !== PRODUCTION) {
//   plugins = plugins.concat([
//     {
//       plugin: '@routes/test.route'
//     }
//   ])
// }

const routesOb = {
  'auth.route': 'auth'
}
const routes = Object.keys(routesOb)

routes.forEach((r) => {
  plugins = plugins.concat([
    {
      plugin: `@routes/${r}`,
      routes: {
        prefix: `/api/v1${routesOb[r] ? `/${routesOb[r]}` : ``}`
      }
    }
  ])
})

exports.manifest = {
  server: {
    router: {
      stripTrailingSlash: true,
      isCaseSensitive: false
    },
    routes: {
      security: {
        hsts: false,
        xss: 'enabled',
        noOpen: true,
        noSniff: true,
        xframe: false
      },
      cors: {
        origin: ['*'],
        // ref: https://github.com/hapijs/hapi/issues/2986
        headers: ['Accept', 'Authorization', 'Content-Type']
      },
      validate: {
        failAction: async (request, h, err) => {
          // [TODO:]error formating
          const { payload } = err.output
          payload.validation.errors = {}
          err.details.forEach((element) => {
            // payload.validation.errors[element.context.key] = element.message.replace(/"/g, '')
            payload.validation.errors[element.context.key] = element.message
          })
          // [TODO:]error formating

          request.server.log(
            ['validation', 'error'],
            'Joi throw validation error'
          )
          throw err
        },
        options: {
          abortEarly: false
        }
      },
      auth: false // remove this to enable authentication or set your authentication profile ie. auth: 'jwt'
    },
    debug: Config.debug,
    port: Config.port
  },
  register: {
    plugins
  }
}

exports.options = {}