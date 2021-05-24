'use strict';
const Config = require('../../../config');

const register = function (server, options) {

  server.route({
    method: 'GET',
    path: '/dashboard',
    options : {
      auth: {
        strategies: ['session']
      }
    },
    handler: function (request, h) {

      const user = request.auth.credentials.user;
      let certificateEligible = true;

      //Determine if user has passed all 3 quizes successfully
      for (const moduleId in user.quizCompleted) {
        if (!user.quizCompleted[moduleId].moduleCompleted || user.quizCompleted[moduleId].score < 80) {
          certificateEligible = false;
          break;
        }
      }

      return h.view('dashboard/index', {
        certificateEligible,
        user,
        trainingCompleted: request.auth.credentials.user.trainingCompleted,
        projectName: Config.get('/projectName'),
        title: 'Dashboard',
        baseUrl: Config.get('/baseUrl')
      });
    }
  });
};

module.exports = {
  name: 'dashboard',
  dependencies: [
    'hapi-anchor-model',
    'auth'
  ],
  register
};
