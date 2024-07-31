'use strict';

const Boom = require('@hapi/boom');
const errorHelper = require('@utilities/error-helper');
const authValidator = require('@validator/auth.validator');

module.exports = {
  login: {
    validate: authValidator.login,
    pre: [
      {
        assign: 'signIn',
        method: async (request, h) => {
          const { server } = request;
          try {
            const { userService } = server.services();
            return await userService.signIn(request);
          } catch (error) {
            errorHelper.handleError(error);
          }
          return h.continue;
        },
      },
    ],
    handler: async (request, h) => {
      return h.response(request.pre.signIn).code(200);
    },
  },

  signUp: {
    validate: authValidator.signUp,
    pre: [
      {
        assign: 'uniqueEmail',
        method: async (request, h) => {
          const { server } = request;
          try {
            const { userService } = server.services();
            return await userService.checkUniqueEmail(request);
          } catch (error) {
            errorHelper.handleError(error);
          }
          return h.continue;
        },
      },
      {
        assign: 'uniqueContactNo',
        method: async (request, h) => {
          const { server, payload } = request;
          try {
            if (payload.contactNo) {
              const { userService } = server.services();
              return await userService.checkUniqueContactNo(request);
            } else {
              return h.continue;
            }
          } catch (error) {
            errorHelper.handleError(error);
          }
          return h.continue;
        },
      },
      {
        assign: 'uniqueUserName',
        method: async (request, h) => {
          const { server } = request;
          try {
            const { userService } = server.services();
            return await userService.generateUniqueUserName(request);
          } catch (error) {
            errorHelper.handleError(error);
          }
          return h.continue;
        },
      },
      {
        assign: 'generateUserId',
        method: async (request, h) => {
          const { server } = request;
          try {
            const { userService } = server.services();
            return await userService.generateUniqueUserId(request);
          } catch (error) {
            errorHelper.handleError(error);
          }
          return h.continue;
        },
      },
      {
        assign: 'signup',
        method: async (request, h) => {
          const { server } = request;
          try {
            const { userService } = server.services();
            const user = await userService.createUser(request);
            if (user) {
              return {
                message: 'User created successfully',
                status: 'success',
              };
            } else {
              errorHelper.handleError('An error occured!!!');
            }
          } catch (error) {
            errorHelper.handleError(error);
          }
        },
      },
    ],
    handler: async (request, h) => {
      return h.response(request.pre.signup).code(201);
    },
  },

  signInGoogle: {
    validate: authValidator.signInGoogle,
    pre: [
      {
        assign: 'generateUserId',
        method: async (request, h) => {
          const { server } = request;
          try {
            const { userService } = server.services();
            return await userService.generateUserId(request);
          } catch (error) {
            errorHelper.handleError(error);
          }
          return h.continue;
        },
      },
      {
        assign: 'signInGoolge',
        method: async (request, h) => {
          const { server } = request;
          try {
            const { userService } = server.services();
            return await userService.signInGoolge(request);
          } catch (error) {
            errorHelper.handleError(error);
          }
          return h.continue;
        },
      },
    ],
    handler: async (request, h) => {
      return h.response(request.pre.signInGoolge).code(201);
    },
  },

  // TODO feture implement
  me: {
    validate: authValidator.me,
    pre: [],
    handler: async (request, h) => {
      const { auth, server } = request;
      try {
        const { userService } = server.services();
        let user = await userService.getUserById(auth.credentials.user._id, { password: 0, oldPassword: 0, userImage: 0, otp: 0 });
        // let user = await UserModel.getUserById(auth.credentials.user._id);
        // const permissions = await userService.getPermission(auth.credentials.user._id)
        // if (permissions && permissions.length) {
        //   user['permissions'] = permissions;
        // }
        // if (!!user.userImage) {
        //   user.userImage = await fileUploadHelper.getBase64Image(
        //     user.userImage,
        //   );
        // } else {
        //   delete user.userImage;
        // }
        return h.response(user).code(200);
      } catch (error) {
        errorHelper.handleError(error);
      }
    },
  },

  getUsers: {
    validate: authValidator.getUsers,
    pre: [
      {
        assign: 'getUsers',
        method: async (request, h) => {
          const { server } = request;
          try {
            const { userService } = server.services();
            return await userService.getUsers(request);
          } catch (error) {
            errorHelper.handleError(error);
          }
          return h.continue;
        },
      },
    ],
    handler: async (request, h) => {
      return h.response(request.pre.getUsers).code(200);
    },
  },

  profileUpdate: {
    validate: authValidator.profileUpdate,
    pre: [
      {
        assign: 'checkUser',
        method: async (request, h) => {
          const { server, auth } = request;
          try {
            const { userService } = server.services();
            const user = await userService.getUserById(auth.credentials.user._id);
            if (user) {
              return user;
            } else {
              errorHelper.handleError(
                Boom.badRequest(
                  'User not found',
                ),
              );
            }
          } catch (error) {
            errorHelper.handleError(error);
          }
          return h.continue;
        },
      },
      {
        assign: 'uniqueEmail',
        method: async (request, h) => {
          const { server, payload } = request;
          try {
            if (payload.email) {
              const { userService } = server.services();
              return await userService.checkUniqueEmail(request);
            } else {
              return h.continue;
            }
          } catch (error) {
            errorHelper.handleError(error);
          }
          return h.continue;
        },
      },
      {
        assign: 'uniqueContactNo',
        method: async (request, h) => {
          const { server, payload } = request;
          try {
            if (payload.contactNo) {
              const { userService } = server.services();
              return await userService.checkUniqueContactNo(request);
            } else {
              return h.continue;
            }
          } catch (error) {
            errorHelper.handleError(error);
          }
          return h.continue;
        },
      },
      {
        assign: 'profileUpdate',
        method: async (request, h) => {
          const { server } = request;
          try {
            const { userService } = server.services();
            return await userService.profileUpdate(request);
          } catch (error) {
            errorHelper.handleError(error);
          }
          return h.continue;
        },
      }
    ],
    handler: async (request, h) => {
      return h.response(request.pre.profileUpdate).code(200)
    },
  },

  // TODO delete user s3 data
  profileDelete: {
    validate: authValidator.profileDelete,
    pre: [
      {
        assign: 'checkUser',
        method: async (request, h) => {
          const { server, params } = request;
          try {
            const { userService } = server.services();
            const user = await userService.getUserById(params.userId);
            if (user && user.role !== 'SUPER_ADMIN') {
              return user;
            } else {
              errorHelper.handleError(
                Boom.badRequest(
                  'Super Admin accounts are essential for system functionality and cannot be deleted',
                ),
              );
            }
          } catch (error) {
            errorHelper.handleError(error);
          }
          return h.continue;
        },
      },
      {
        assign: 'profileDelete',
        method: async (request, h) => {
          const { server } = request;
          try {
            const { userService } = server.services();
            return await userService.profileDelete(request);
          } catch (error) {
            errorHelper.handleError(error);
          }
          return h.continue;
        },
      },
    ],
    handler: async (request, h) => {
      return h.response(request.pre.profileDelete).code(201);
    },
  },

  changePass: {
    validate: authValidator.changePass,
    pre: [
      {
        assign: 'checkUser',
        method: async (request, h) => {
          const { server, auth } = request;
          try {
            const { userService } = server.services();
            const user = await userService.getUserById(auth.credentials.user._id);
            if (user) {
              return user;
            } else {
              errorHelper.handleError(
                Boom.badRequest(
                  'User not found',
                ),
              );
            }
          } catch (error) {
            errorHelper.handleError(error);
          }
          return h.continue;
        },
      },
      {
        assign: 'changePass',
        method: async (request, h) => {
          const { server } = request;
          try {
            const { userService } = server.services();
            return await userService.changePass(request);
          } catch (error) {
            errorHelper.handleError(error);
          }
          return h.continue;
        },
      },
    ],
    handler: async (request, h) => {
      return h.response(request.pre.changePass).code(200);
    },
  },

  forgotReq: {
    validate: authValidator.forgotReq,
    pre: [
      {
        assign: 'checkUser',
        method: async (request, h) => {
          const { server } = request;
          try {
            const { userService } = server.services();
            const user = await userService.checkUser(request);
            if (user) {
              return user;
            } else {
              errorHelper.handleError(
                Boom.badRequest(
                  'User not found. Please verify your email address and try again',
                ),
              );
            }
          } catch (error) {
            errorHelper.handleError(error);
          }
          return h.continue;
        },
      },
      {
        assign: 'sendOTPMail',
        method: async (request, h) => {
          const { server } = request;
          try {
            const { userService } = server.services();
            return await userService.sendOTPMail(request);
          } catch (error) {
            errorHelper.handleError(error);
          }
          return h.continue;
        },
      },
    ],
    handler: async (request, h) => {
      return h.response(request.pre.sendOTPMail).code(201);
    },
  },

  verifyOtp: {
    validate: authValidator.verifyOtp,
    pre: [
      {
        assign: 'checkUser',
        method: async (request, h) => {
          const { server } = request;
          try {
            const { userService } = server.services();
            const user = await userService.checkUser(request);
            if (user) {
              return user;
            } else {
              errorHelper.handleError(
                Boom.badRequest(
                  'User not found. Please verify your email address and try again',
                ),
              );
            }
          } catch (error) {
            errorHelper.handleError(error);
          }
          return h.continue;
        },
      },
      {
        assign: 'verifyOtp',
        method: async (request, h) => {
          const { server } = request;
          try {
            const { userService } = server.services();
            return await userService.verifyOtp(request);
          } catch (error) {
            errorHelper.handleError(error);
          }
          return h.continue;
        },
      },
    ],
    handler: async (request, h) => {
      return h.response(request.pre.verifyOtp).code(201);
    },
  },

  resetPassword: {
    validate: authValidator.resetPassword,
    pre: [
      {
        assign: 'checkUser',
        method: async (request, h) => {
          const { server, auth } = request;
          try {
            const { userService } = server.services();
            const user = await userService.getUserById(auth.credentials.user._id);
            console.log('user: ', user);
            if (user) {
              return user;
            } else {
              errorHelper.handleError(
                Boom.badRequest(
                  'User not found',
                ),
              );
            }
          } catch (error) {
            errorHelper.handleError(error);
          }
          return h.continue;
        },
      },
      {
        assign: 'resetPassword',
        method: async (request, h) => {
          const { server } = request;
          try {
            const { userService } = server.services();
            return await userService.resetPassword(request);
          } catch (error) {
            errorHelper.handleError(error);
          }
          return h.continue;
        },
      }
    ],
    handler: async (request, h) => {
      return h.response(request.pre.resetPassword).code(200)
    },
  },
};
