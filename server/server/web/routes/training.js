'use strict';
const Config = require('../../../config');

const register = function (server, options) {

  server.route({
    method: 'GET',
    path: '/training-module/{moduleId}',
    options : {
      auth: {
        strategies: ['session']
      }
    },
    handler: function (request, h) {

      const view = 'training/module' + request.params.moduleId.toString();
      return h.view(view, {
        user: request.auth.credentials.user,
        trainingCompleted: request.auth.credentials.user.trainingCompleted,
        moduleId: request.params.moduleId,
        projectName: Config.get('/projectName'),
        title: 'Training Module',
        baseUrl: Config.get('/baseUrl')
      });
    }
  });
};

module.exports = {
  name: 'trainingModule',
  dependencies: [
    'hapi-anchor-model',
    'auth'
  ],
  register
};
