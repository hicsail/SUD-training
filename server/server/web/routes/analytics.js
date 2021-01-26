'use strict';
const Config = require('../../../config');
const User = require('../../models/user');

const register = function (server, options) {

  server.route({
    method: 'GET',
    path: '/analytics',
    options : {
      auth: {
        strategies: ['session']
      }
    },
    handler: async function (request, h) {

      const counts = { '1': {}, '2': {}, '3': {}, 'total': {} };


      for (const moduleId in counts) {
        const filter = {};
        const cond1 = 'quizCompleted.'  + moduleId + '.score';
        const cond2 = 'quizCompleted.'  + moduleId + '.moduleCompleted';

        //Calculate number of users who completed the quiz for module
        filter[cond2] = true;
        counts[moduleId].numCompleted = await User.count(filter);

        //Calculate number of users who failed the quiz for module
        filter[cond1] = { $lt: 80 };
        counts[moduleId].numFailed = await User.count(filter);

        //Calculate number of users who successfully completed the quiz for module
        counts[moduleId].numPassed = counts[moduleId].numCompleted - counts[moduleId].numFailed;
      }

      const filter = {
        'quizCompleted.1.moduleCompleted' : true,
        'quizCompleted.2.moduleCompleted' : true,
        'quizCompleted.3.moduleCompleted' : true
      };
      counts.total.numCompleted = await User.count(filter);

      filter.$or = [
        { 'quizCompleted.1.score': { $lt: 80 } },
        { 'quizCompleted.2.score': { $lt: 80 } },
        { 'quizCompleted.3.score': { $lt: 80 } }
      ];
      counts.total.numFailed = await User.count(filter);

      counts.total.numPassed = counts.total.numCompleted - counts.total.numFailed;

      //console.log(counts)

      return h.view('analytics/index', {
        user: request.auth.credentials.user,
        projectName: Config.get('/projectName'),
        title: 'Analytics',
        baseUrl: Config.get('/baseUrl'),
        counts
      });
    }
  });
};

module.exports = {
  name: 'analytics',
  dependencies: [
    'hapi-anchor-model',
    'auth'
  ],
  register
};
