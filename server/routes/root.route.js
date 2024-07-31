'use strict';
// Never take constants here
module.exports = {
  plugin: {
    async register(server, options) {
      server.route([
        {
          method: 'GET',
          path: '/',
          config: {
            auth: null,
            plugins: {
              policies: [],
            },
            tags: [],
            handler: async (request, h) => {
              return h.response({
                up:
                  new Date().getTime() -
                  request.server.info.started +
                  ', ' +
                  "welcome folk's🎉",
              });
            },
          },
        },
        // {
        //   method: 'GET',
        //   path: '/uploads/{file*}',
        //   handler: {
        //     directory: {
        //       path: 'uploads',
        //       listing: true,
        //     },
        //   },
        // },
      ]);
    },
    version: require('../../package.json').version,
    name: 'root-routes',
  },
};
