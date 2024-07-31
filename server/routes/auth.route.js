'use strict';
// Never take constants here
module.exports = {
  plugin: {
    async register(server, options) {
      const API = require('@api/auth.api');
      const authScope = ['STUDENT', 'PARENT', 'TECHER', 'STAFF', 'ADMIN', 'SUPER_ADMIN', 'USER'];
      server.route([
        {
          method: 'post',
          path: '/signIn',
          config: {
            auth: null,
            plugins: {
              policies: ['log.policy'],
              'hapi-swagger': {
                security: []
              }
            },
            tags: ['api', 'Authentication'],
            description: 'Login',
            notes: '{ "email": "Mr_lakhani", "password": "Admin@123" }',
            validate: API.login.validate,
            pre: API.login.pre,
            handler: API.login.handler,
          },
        },

        {
          method: 'post',
          path: '/googleSignIn',
          config: {
            auth: null,
            plugins: {
              policies: ['log.policy']
            },
            tags: ['api', 'Authentication'],
            description: 'SignIN with Google',
            notes: 'SignIN with Google',
            validate: API.signInGoogle.validate,
            pre: API.signInGoogle.pre,
            handler: API.signInGoogle.handler,
          },
        },

        {
          method: 'post',
          path: '/signUp',
          config: {
            auth: null,
            plugins: {
              policies: ['log.policy']
            },
            tags: ['api', 'Authentication'],
            description: 'signUp',
            notes: 'signUp',
            validate: API.signUp.validate,
            pre: API.signUp.pre,
            handler: API.signUp.handler,
          },
        },

        {
          method: 'GET',
          path: '/me',
          config: {
            auth: {
              strategy: 'auth',
              scope: authScope
            },
            plugins: {
              policies: ['log.policy'],
              'hapi-swagger': {
                security: [
                  {
                    ApiKeyAuth: []
                  }
                ]
              }
            },
            tags: ['api', 'Authentication'],
            description: 'Me',
            notes: 'Me',
            validate: API.me.validate,
            pre: API.me.pre,
            handler: API.me.handler
          }
        },

        {
          method: 'get',
          path: '/users',
          config: {
           auth: {
              strategy: 'auth',
              scope: authScope
            },
            plugins: {
              policies: ['log.policy'],
              'hapi-swagger': {
                security: [
                  {
                    ApiKeyAuth: []
                  }
                ]
              }
            },
            tags: ['api', 'Authentication'],
            description: 'get Users',
            notes: 'get Users',
            validate: API.getUsers.validate,
            pre: API.getUsers.pre,
            handler: API.getUsers.handler,
          },
        },

        {
          method: 'put',
          path: '/user/profile',
          config: {
            auth: {
              strategy: 'auth',
              scope: authScope
            },
            plugins: {
              policies: ['log.policy'],
              'hapi-swagger': {
                // payloadType: 'form',
                security: [
                  {
                    ApiKeyAuth: []
                  }
                ]
              }
            },
            // payload: {
            //   maxBytes: 1024 * 1024 * 5,
            //   multipart: {
            //     output: 'stream',
            //   },
            //   parse: true,
            //   allow: 'multipart/form-data',
            //   timeout: false,
            // },
            tags: ['api', 'Authentication'],
            description: 'Update User Details',
            notes: 'Update User Details',
            validate: API.profileUpdate.validate,
            pre: API.profileUpdate.pre,
            handler: API.profileUpdate.handler,
          },
        },

        {
          method: 'delete',
          path: '/user/{userId}',
          config: {
            auth: {
              strategy: 'auth',
              scope: ['SUPER_ADMIN', 'ADMIN']
            },
            plugins: {
              policies: ['log.policy'],
              'hapi-swagger': {
                security: [
                  {
                    ApiKeyAuth: []
                  }
                ]
              }
            },
            tags: ['api', 'Authentication'],
            description: 'delete user account',
            notes: 'delete user account',
            validate: API.profileDelete.validate,
            pre: API.profileDelete.pre,
            handler: API.profileDelete.handler,
          },
        },

        // {
        //   method: 'put',
        //   path: '/role',
        //   config: {
        //     auth: {
        //       strategy: 'auth',
        //       scope: ['SUPER_ADMIN']
        //     },
        //     plugins: {
        //       policies: ['log.policy'],
        //       'hapi-swagger': {
        //         security: [
        //           {
        //             ApiKeyAuth: []
        //           }
        //         ]
        //       }
        //     },
        //     tags: ['api', 'Authentication'],
        //     description: 'Assign role to user',
        //     notes: 'Assign role to user',
        //     validate: API.assignRole.validate,
        //     pre: API.assignRole.pre,
        //     handler: API.assignRole.handler,
        //   },
        // },

        // {
        //   method: 'post',
        //   path: '/request',
        //   config: {
        //     auth: {
        //       strategy: 'auth',
        //       scope: ['USER']
        //     },
        //     plugins: {
        //       policies: ['log.policy'],
        //       'hapi-swagger': {
        //         security: [
        //           {
        //             ApiKeyAuth: []
        //           }
        //         ]
        //       }
        //     },
        //     tags: ['api', 'Authentication'],
        //     description: 'user request for update role',
        //     notes: 'user request for update role',
        //     validate: API.updateRequest.validate,
        //     pre: API.updateRequest.pre,
        //     handler: API.updateRequest.handler,
        //   },
        // },

        {
          method: 'put',
          path: '/user/change-pass',
          config: {
            auth: {
              strategy: 'auth',
              scope: authScope
            },
            plugins: {
              policies: ['log.policy'],
              'hapi-swagger': {
                security: [
                  {
                    ApiKeyAuth: []
                  }
                ]
              }
            },
            tags: ['api', 'Authentication'],
            description: 'chnage user password',
            notes: 'chnage user password',
            validate: API.changePass.validate,
            pre: API.changePass.pre,
            handler: API.changePass.handler,
          },
        },

        {
          method: 'post',
          path: '/forgot-password',
          config: {
            auth: null,
            plugins: {
              policies: ['log.policy'],
              'hapi-swagger': {
                security: []
              }
            },
            tags: ['api', 'Authentication'],
            description: 'Request for forgot user password',
            notes: 'Request for forgot user password',
            validate: API.forgotReq.validate,
            pre: API.forgotReq.pre,
            handler: API.forgotReq.handler,
          },
        },

        {
          method: 'post',
          path: '/verify-otp',
          config: {
            auth: null,
            plugins: {
              policies: ['log.policy'],
              'hapi-swagger': {
                security: []
              }
            },
            tags: ['api', 'Authentication'],
            description: 'Request for Verify Otp',
            notes: 'Request for Verify Otp',
            validate: API.verifyOtp.validate,
            pre: API.verifyOtp.pre,
            handler: API.verifyOtp.handler,
          },
        },

        {
          method: 'put',
          path: '/reset-password',
          config: {
            auth: {
              strategy: 'auth',
              scope: authScope
            },
            plugins: {
              policies: ['log.policy'],
              'hapi-swagger': {
                security: [
                  {
                    ApiKeyAuth: []
                  }
                ]
              }
            },
            tags: ['api', 'Authentication'],
            description: 'reset DSC user password',
            notes: 'reset DSC user password',
            validate: API.resetPassword.validate,
            pre: API.resetPassword.pre,
            handler: API.resetPassword.handler,
          }
        },
      ]);
    },
    version: require('../../package.json').version,
    name: 'auth-routes',
  },
};
