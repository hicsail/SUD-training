'use strict';
const Config = require('../../../config');
const Questions = require('../../questions');

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
        moduleTitles: {'1': Questions[0]['title'], '2': Questions[1]['title'], '3': Questions[2]['title']},
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
