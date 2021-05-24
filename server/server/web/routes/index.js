'use strict';
const Config = require('../../../config');
//const PermissionConfigTable = require('../../permission-config.json');
//const DefaultScopes = require('../../helper/getRoleNames');

const register = function (server, options) {

  server.route({
    method: 'GET',
    path: '/',
    options: {
      auth: {
        strategies: ['simple', 'session'],
        //scope: PermissionConfigTable.GET['/'] || DefaultScopes,
        mode: 'try'
      }
    },
    handler: function (request, h) {

      let certificateEligible = false;
      let user = null;
      let view = 'index/index';

      if (request.auth.isAuthenticated) {
        user = request.auth.credentials.user;
        view = 'dashboard/index';
        
        //Determine if user has passed all 3 quizes successfully
        certificateEligible = true;
        for (const moduleId in user.quizCompleted) {
          if (!user.quizCompleted[moduleId].moduleCompleted || user.quizCompleted[moduleId].score < 80) {
            certificateEligible = false;
            break;
          }
        }
      }

      return h.view(view, {
        user,
        certificateEligible,
        projectName: Config.get('/projectName'),
        title: 'Home',
        baseUrl: Config.get('/baseUrl')
      });
    }
  });
};

module.exports = {
  name: 'home',
  dependencies: [
    'hapi-anchor-model',
    'auth'
  ],
  register
};
