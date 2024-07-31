'use strict'

require('module-alias/register')
const dotenv = require('dotenv')
dotenv.config()

const Glue = require('@hapi/glue')
const Glob = require('glob')
const serverConfig = require('./config/manifest')
const path = require('path');

// this is the line we mention in manifest.js
// relativeTo parameter should be defined here
const options = {
  ...serverConfig.options,
  relativeTo: __dirname
}

// Start server
const startServer = async () => {
  try {
    const server = await Glue.compose(
      serverConfig.manifest,
      options
    )

    const services = Glob.sync('server/services/*.js')
    services.forEach(service => {
      server.registerService(require(`${process.cwd()}/${service}`))
    })

    server.route({
      method: 'GET',
      path: '/public/{param*}',
      handler: {
        directory: {
          path: path.join(__dirname, 'public')
        }
      }
    })
    
    await server.start()
    console.log(`Server listening on ${server.info.uri}`)
    console.log(`Evn file DB :${process.env.DB}`)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

startServer()
