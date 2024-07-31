'use strict';

const config = require('config');
const Schmervice = require('@hapipal/schmervice');
const errorHelper = require('@utilities/error-helper');
const Boom = require('@hapi/boom');
const helper = require('@utilities/helper');
const bcrypt = require('bcryptjs');
const User = require('@models/user.model').schema;
const token = require('@utilities/create-token');
const fileUploadHelper = require('@utilities/uploadFile-helper');
const moment = require('moment');
const nodemailer = require('nodemailer')

module.exports = class UserService extends Schmervice.Service {
  async getUserById(id, removeExtraCredentails) {
    try {
      return await User.findById(id, {
        ...removeExtraCredentails,
        isDelete: 0,
        createdAt: 0,
        updatedAt: 0,
        provider: 0,
        lastLogin: 0
      }).lean();
    } catch (err) {
      errorHelper.handleError(err);
    }
  }

  async generateUniqueUserId(request) {
    const { payload } = request;
    try {
      const userCount = await User.find({}).count();
      payload.userId = `DSC${helper.addLeadingZeros(userCount + 1, 8)}`;
      return await this.checkUniqueUserID(request);
    } catch (e) {
      return errorHelper.handleError(e);
    }
  }

  async generateUniqueUserName(request) {
    const { payload } = request;
    try {
      payload.userName = await helper.generateUsername(
        payload.firstName,
        payload.lastName,
      );
      return await this.checkUniqueUserName(request);
    } catch (error) {
      return errorHelper.handleError(error);
    }
  }

  async checkUniqueUserID(request) {
    const { payload } = request;
    try {
      const user = await User.findOne({
        userId: payload.userId,
      });
      if (user) {
        this.generateUserId(request);
      } else {
        return true;
      }
    } catch (error) {
      return errorHelper.handleError(error);
    }
  }

  async checkUniqueEmail(request) {
    const { payload } = request;
    try {
      const user = await User.findOne({
        email: payload.email,
      });
      if (user) {
        errorHelper.handleError(
          Boom.badRequest('Email address is already exist'),
        );
      } else {
        return true;
      }
    } catch (error) {
      return errorHelper.handleError(error);
    }
  }

  async checkUniqueUserName(request) {
    const { payload } = request;
    try {
      const user = await User.findOne({
        userName: payload.userName,
      });
      if (user) {
        this.generateUniqueUserName(request);
      } else {
        return payload.userName;
      }
    } catch (error) {
      return errorHelper.handleError(error);
    }
  }

  async checkUniqueContactNo(request) {
    const { payload } = request;
    try {
      const user = await User.findOne({
        contactNo: payload.contactNo,
      });
      if (user) {
        errorHelper.handleError(
          Boom.badRequest('Mobile Number is already exist'),
        );
      } else {
        return true;
      }
    } catch (error) {
      return errorHelper.handleError(error);
    }
  }

  async createUser(request) {
    const { payload } = request;
    try {
      delete payload.coPassword;
      const saltRounds = 10;
      const hashedPassword = await new Promise((resolve, reject) => {
        bcrypt.hash(payload.password, saltRounds, (error, hash) => {
          if (error) {
            reject(new Error('Password Must be Strong!!!'));
          } else {
            resolve(hash);
          }
        });
      });
      payload.password = hashedPassword;
      const createdUser = await User.create(payload);
      if (createdUser) {
        return createdUser;
      } else {
        errorHelper.handleError(
          Boom.badRequest('Oops!, Please try again later'),
        );
      }
    } catch (error) {
      errorHelper.handleError(error);
    }
  }

  async signIn(request) {
    const { payload } = request;
    try {
      const getUser = await User.findOne(
        {
          $or: [{ userName: payload.email }, { email: payload.email }],
          isDelete: false,
        },
        {
          oldPassword: 0,
          isDelete: 0,
          createdAt: 0,
          updatedAt: 0,
          provider: 0,
          otp: 0,
        },
      ).lean();

      console.log('getUser: ', getUser);
      if (getUser) {
        if (
          getUser.username == payload.username ||
          getUser.email == payload.username
        ) {
          const isMatch = await bcrypt.compare(
            payload.password,
            getUser.password,
          );
          if (isMatch === true) {
            const credentailsToken = token.createToken(
              getUser,
              payload.check ? '168h' : config.constants.EXPIRATION_PERIOD, // 7 days || 1 day
            );
            if (getUser.userImage) {
              getUser.userImage = await fileUploadHelper.getBase64Image(
                `${config.constants.s3Prefix}/users/${getUser._id}/${getUser.userImage}`,
              );
            } else {
              // for console-side default dp
              delete getUser.userImage;
            }
            await User.findByIdAndUpdate(getUser._id, { lastLogin: moment() });
            delete getUser.password;
            delete getUser._id;
            return {
              message: 'Login Sucessfully',
              token: credentailsToken,
              user: getUser,
            };
          } else {
            errorHelper.handleError(
              Boom.badRequest('Incorrect password. Please double-check your password and try again'),
            );
          }
        }
      } else {
        errorHelper.handleError(
          Boom.badRequest('Please verify your username or email and password combination and try again'),
        );
      }
    } catch (error) {
      errorHelper.handleError(error);
    }
  }

  async signInGoolge(request) {
    const { payload } = request;
    try {
      const userData = await User.findOne({
        $or: [{ email: payload.email }, { userName: payload.name }],
      });
      if (userData && userData.provider == 'GOOGLE') {
        // send token
        const credentailsToken = token.createToken(
          userData,
          config.constants.EXPIRATION_PERIOD,
        );
        return {
          message: 'SignIn with google Sucessfull!🎉',
          token: credentailsToken,
          user: userData,
        };
      } else {
        // cretae and send token
        let newUser;
        payload.userName = payload.name;
        delete payload.name;
        payload.provider = payload.provider ? payload.provider : 'GOOGLE';
        const userPass = helper.generatePassword(
          payload.firstName,
          payload.lastName,
        );
        const saltRounds = 10;
        bcrypt.hash(userPass, saltRounds, async (err, hash) => {
          if (err) {
            generatePassword();
          } else {
            payload.password = hash;
            newUser = await User.create(payload);
          }
        });
        if (newUser) {
          const credentailsToken = token.createToken(
            newUser,
            config.constants.EXPIRATION_PERIOD,
          );
          return {
            message:
              "Welcome aboard! You've successfully signed in with Google",
            token: credentailsToken,
            user: newUser,
          };
        } else {
          errorHelper.handleError(
            Boom.badRequest(
              'Something is temporariy wrong with your network connection, try again!!!',
            ),
          );
        }
      }
    } catch (error) {
      errorHelper.handleError(error);
    }
  }

  async checkUser(request) {
    const { payload } = request;
    try {
      return await User.findOne({ email: payload.email });
    } catch (error) {
      errorHelper.handleError(error)
    }
  }

  async getUsers(request) {
    const { query, auth } = request;
    try {
      let params = {
        isDelete: false,
      };
      let selected = {
        _id: 0,
        userId: 0,
        userImage: 0,
        password: 0,
        oldPassword: 0,
        isDelete: 0,
        createdAt: 0,
        updatedAt: 0,
        provider: 0,
        otp: 0,
        lastLogin: 0
      }
      if (query.userId === 'Profile') {
        params._id = auth.credentials.user._id;
        delete selected.userImage;
      }
      if (query.userId === 'All') {
        delete params.isDelete;
      }
      let users = await User.find(params, selected).lean();
      if (query.userId === 'Profile' && users && !!users[0].userImage) {
        users[0].userImage = await fileUploadHelper.getBase64Image(
          `${config.constants.s3Prefix}/users/${users[0]._id}/${users[0].userImage}`,
        );
        return users[0];
      } else {
        return users;
      }
    } catch (error) {
      errorHelper.handleError(error);
    }
  }

  async sendOTPMail(request) {
    const { payload, pre: { checkUser } } = request;
    try {
      const Otp = {
        otp: Math.floor(Math.random() * 1000000),
        expirationTime: moment().add(5, 'minutes')
      }
      if (checkUser) {
        const trasporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
          },
        });
        // otp store in model and remove from response
        await User.findOneAndUpdate(
          { _id: checkUser._id, email: payload.email },
          { otp: Otp },
          { new: true },
        );
        const mailOption = {
          from: process.env.MAIL_USER,
          to: checkUser.email,
          subject: 'Forgot Password OTP',
          html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Forgot Password OTP</title>
              <style>
                  body {
                      font-family: Arial, sans-serif;
                      background-color: #f4f4f4;
                      color: #333;
                      padding: 20px;
                  }
                  .container {
                      max-width: 600px;
                      margin: 0 auto;
                      background-color: #fff;
                      padding: 20px;
                      border-radius: 8px;
                      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                  }
                  h2 {
                      color: #007bff;
                  }
                  .otp-container {
                      border: 2px solid #007bff;
                      padding: 10px;
                      border-radius: 4px;
                      margin: 20px 0;
                  }
                  h3 {
                      margin: 0;
                      font-size: 24px;
                      color: #007bff;
                  }
              </style>
          </head>
          
          <body>
              <div class="container">
                  <h2>Forgot Password OTP</h2>
                  <p>Hello ${checkUser.userName},</p>
          
                  <p>We received a request to reset your password. Please use the following One-Time Password (OTP) to proceed with the password reset:</p>
          
                  <div class="otp-container">
                      <h3>${Otp.otp}</h3>
                  </div>
          
                  <p>If you didn't request a password reset, please ignore this email. The OTP is valid for a short period for security reasons.</p>
          
                  <p>Thank you,</p>
                  <p>Team DSC</p>
              </div>
          
          </body>
          
          </html>
          
          `
        };
        await trasporter.sendMail(mailOption);
        // genrate partial Email
        const partialEmail = checkUser.email.replace(
          /(\w{3})[\w.-]+@([\w.]+\w)/,
          '$1***@$2',
        );
        return { status: "success", message: `We've sent the OTP to your email ${partialEmail}` };
      } else {
        errorHelper.handleError(Boom.badRequest(`User not found. Please verify your email address and try again`));
      }
    } catch (error) {
      errorHelper.handleError(error);
    }
  }

  async verifyOtp(request) {
    const { payload, pre: { checkUser } } = request;
    console.log('checkUser: ', checkUser);
    try {
      if (checkUser.otp && checkUser.otp.otp === payload.otp) {
        if (moment(checkUser.otp.expirationTime).isAfter(moment())) {
          const credentailsToken = token.createToken(
            checkUser,
            60 * 60 * 15,
          );
          const reseturl = `${config.constants.CONSOLE_BASEPATH}/resetPassword?token=${credentailsToken}`; // 15 min valid
          const trasporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.MAIL_USER,
              pass: process.env.MAIL_PASS,
            },
          });
          const mailOption = {
            from: process.env.MAIL_USER,
            to: checkUser.email,
            subject: 'Reset Password',
            html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Reset Password</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        color: #333;
                        padding: 20px;
                    }
                     .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #fff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }
                    h2 {
                        color: #007bff;
                    }
                    p {
                        margin-bottom: 15px;
                    }
                    a {
                        color: #007bff;
                        text-decoration: none;
                    }
                    a:hover {
                        text-decoration: underline;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Password Reset</h2>
                    <p>Hello ${checkUser.userName},</p>
            
                    <p>We received a request to reset your password. To proceed, click on the link below</p>
            
                    <p><a href="${reseturl}">Reset Your Password</a></p>
            
                    <p>If you didn't request a password reset, please ignore this email. The link is valid for the next 15 minutes for security reasons.</p>
            
                    <p>Thank you,</p>
                    <p>Team DSC</p>
                </div>
            </body>
            </html>
            `
          }
          await trasporter.sendMail(mailOption);
          // genrate partial Email
          const partialEmail = checkUser.email.replace(
            /(\w{3})[\w.-]+@([\w.]+\w)/,
            '$1***@$2',
          );
          return { status: "success", message: `We've sent a password reset link to your email ${partialEmail}, Please check your inbox` };
        } else {
          errorHelper.handleError(Boom.badRequest('Oops! The OTP has expired.'))
        }
      } else {
        errorHelper.handleError(Boom.badRequest('Invalid OTP entered.'))
      }
    } catch (error) {
      errorHelper.handleError(error);
    }
  }

  async resetPassword(request) {
    try {
      const { payload, pre: { checkUser } } = request;
      if (checkUser) {
        if (payload.password === payload.coPassword) {
          const isMatch = await bcrypt.compare(
            payload.password,
            checkUser.password
          );
          if (!isMatch) {
            const oldMatch = await bcrypt.compare(
              payload.password,
              checkUser.oldPassword
            );
            if (!oldMatch) {
              const saltRounds = 10;
              bcrypt.hash(payload.password, saltRounds, async (err, hash) => {
                await User.findByIdAndUpdate(checkUser._id, {
                  $set: {
                    password: hash,
                    oldPassword: checkUser.password
                  }
                });
              });
              return { message: 'Password reset successfully' }
            } else {
              return { message: 'Password cannot be same as old password' }
            }
          } else {
            return { message: 'Password cannot be same as old password' }
          }
        } else {
          errorHelper.handleError(
            Boom.badRequest(`Password does not match`),
          );
        }
      } else {
        errorHelper.handleError(Boom.badRequest(`An error occured!`));
      }
    } catch (error) {
      errorHelper.handleError(error);
    }
  }

  async changePass(request) {
    const { payload, pre: { checkUser } } = request;
    console.log('checkUser: ', checkUser);
    try {
      if (checkUser) {
        const isMatch = await bcrypt.compare(
          payload.oldPassword,
          checkUser.password
        );
        if (isMatch) {
          let oldMatch = false;
          if(checkUser.oldPassword) {
            oldMatch = await bcrypt.compare(
              payload.password,
              checkUser.oldPassword
            );
          }
          if (!oldMatch) {
            if (payload.password === payload.coPassword) {
              const saltRounds = 10;
              bcrypt.hash(payload.password, saltRounds, async (err, hash) => {
                await User.findByIdAndUpdate(checkUser._id, {
                  password: hash,
                  oldPassword: checkUser.password
                });
              });
              return { message: 'Change Password Succesfully' };
            } else {
              errorHelper.handleError(
                Boom.badRequest('Password does not match'),
              );
            }
          } else {
            errorHelper.handleError(
              Boom.badRequest('Password cannot be same as old password'),
            );
          }
        } else {
          errorHelper.handleError(
            Boom.badRequest('Password does not match with your existing password'),
          );
        }
      } else {
        errorHelper.handleError(
          Boom.badRequest(`something worng with user credentails!!!`)
        );
      }
    } catch (error) {
      errorHelper.handleError(error);
    }
  }

  async profileUpdate(request) {
    const { payload, pre: { checkUser } } = request;
    try {
      const isMatch = await bcrypt.compare(
        payload.password,
        checkUser.password
      );
      if (isMatch) {
        delete payload.password;
        if (payload.userImage) {
          const fileUpload = async (file) => {
            const upload = await fileUploadHelper.handleFileUpload(
              payload.userImage,
              `${config.constants.s3Prefix}/users/${checkUser._id}`,
              'private_bucket',
            );
            return upload;
          };
          const res = await fileUpload(file);
          payload['userImage'] = res.filePath; // modify payload
        }
        await User.findByIdAndUpdate(checkUser._id, payload);
        // if (!!updatedUser.userImage) {
        //   updatedUser.userImage = await fileUploadHelper.getBase64Image(
        //     `${config.constants.s3Prefix}/users/${checkUser._id}/${checkUser.userImage}`,
        //   );
        // }
        return { message: 'Your profile update succesfully' };
      } else {
        errorHelper.handleError(
          Boom.badRequest('Incorrect password. Please double-check your password and try again'),
        );
      }
    } catch (error) {
      errorHelper.handleError(error);
    }
  }

  // like a deactivate user
  async profileDelete(request) {
    const { pre: { checkUser } } = request;
    try {
      const deletedUser = await User.findByIdAndUpdate(checkUser._id,
        {
          $set: {
            isDelete: true,
          }
        }
      );
      //  delete public buket data
      // `${config.constants.s3Prefix}/users/${checkUser._id}`
      if (deletedUser && deletedUser.isDelete) {
        return { message: 'user deleted successfully' };
      } else {
        errorHelper.handleError(Boom.badRequest(`An error occurred!!`));
      }
    } catch (error) {
      errorHelper.handleError(error)
    }
  }
};