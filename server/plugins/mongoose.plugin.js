'use strict';

const db = require('mongoose');
const Glob = require('glob');

db.Promise = require('bluebird');
const bcrypt = require('bcryptjs');

let dbConn = null;

exports.plugin = {
  async register(server, options) {
    try {
      console.log('options.connections.db');
      console.log(options.connections.db);
      dbConn = await db.createConnection(options.connections.db);

      // When the connection is connected
      dbConn.on('connected', () => {
        server.log(['mongoose', 'info'], 'dbConn Mongo Database connected');
      });

      // When the connection is disconnected
      dbConn.on('disconnected', () => {
        server.log(['mongoose', 'info'], 'dbConn Mongo Database disconnected');
      });

      server.decorate('server', 'db', dbConn);

      // If the node process ends, close the mongoose connection
      process.on('SIGINT', async () => {
        await dbConn.close();
        server.log(
          ['mongoose', 'info'],
          'Mongo Database disconnected through app termination',
        );
        process.exit(0);
      });

      const UserModel = require('../models/user.model').schema;

      let signUpData = await UserModel.find();
      if (!signUpData.length) {
        console.log(
          '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> cretae deafaualt user >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>',
        );
        const saltRounds = 10;
        bcrypt.hash('Admin@123', saltRounds, async (err, hash) => {
          await UserModel.create({
            firstName: 'Brijesh',
            lastName: 'Lakhani',
            email: 'lakhani@mail.io',
            userName: 'Mr_lakhani',
            userId: 'DSC00000001',
            address1: ' ',
            address2: ' ',
            city: 'Surat',
            state: 'Gujarat',
            country: 'India',
            zip: ' ',
            role: 'SUPER_ADMIN',
            password: hash,
            provider: 'DSC',
          });
        });
      }

      // Load models
      const models = Glob.sync('server/models/*.js');
      models.forEach((model) => {
        require(`${process.cwd()}/${model}`);
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  dbConn() {
    return dbConn;
  },
  name: 'mongoose_connector',
  version: require('../../package.json').version,
};
