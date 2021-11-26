'use strict';
const Config = require('../../../config');
const Questions = require('../../questions');
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

      let user = null;
      let view = 'index/index';

      if (request.auth.isAuthenticated) {
        user = request.auth.credentials.user;
        view = 'dashboard/index';        
      }

      return h.view(view, {
        user,        
        projectName: Config.get('/projectName'),
        moduleTitles: {'1': Questions[0]['title'], '2': Questions[1]['title'], '3': Questions[2]['title']},
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
