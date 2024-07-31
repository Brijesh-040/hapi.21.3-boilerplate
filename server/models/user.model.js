'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Types = Schema.Types;

const modelName = 'users';

const dbConn = require('@plugins/mongoose.plugin').plugin.dbConn();

const OtpSchema = new Schema(
  {
    otp: {
      type: Types.Number
    },
    expirationTime: {
      type: Types.Date
    }
  },
  {
    _id: false,
    id: false
  }
)

const userSchema = new Schema(
  {
    firstName: {
      type: Types.String,
      required: true
    },
    lastName: {
      type: Types.String,
      required: true
    },
    email: {
      type: Types.String,
      unique: true,
      index: true,
      stringType: 'email',
      canSearch: true,
      required: true,
    },
    contactNo: {
      type: Types.String,
      unique: true,
      index: true,
      canSearch: true,
      default: null,
    },
    userName: {
      type: Types.String,
      unique: true,
      index: true,
      canSearch: true,
      required: true,
    },
    userId: {
      type: Types.String,
      default: null,
    },
    userImage: {
      type: Types.Mixed,
      default: null
    },
    address1: {
      type: Types.String,
      default: null,
    },
    address2: {
      type: Types.String,
      default: null,
    },
    city: {
      type: Types.String,
      default: null,
    },
    state: {
      type: Types.String,
      default: null,
    },
    country: {
      type: Types.String,
      default: null,
    },
    zip: {
      type: Types.Number,
      default: null,
    },
    password: {
      type: Types.String,
      required: true,
    },
    oldPassword: {
      type: Types.String,
      default: null,
    },
    role: {
      type: Types.String,
      enum: ['STUDENT', 'PARENT', 'TECHER', 'STAFF', 'ADMIN', 'SUPER_ADMIN', 'USER'],
      default: 'USER',
    },
    provider: {
      type: Types.String,
      enum: ['DSC', 'GOOGLE', 'IMPORT'],
      default: 'DSC',
    },
    otp: {
      type: OtpSchema,
    },
    isDelete: {
      type: Types.Boolean,
      default: false
    }
  },
  {
    versionKey: false,
    strict: false,
    timestamps: true,
  },
);

exports.schema = dbConn.model(modelName, userSchema);
