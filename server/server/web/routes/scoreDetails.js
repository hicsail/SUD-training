'use strict'
const Config = require('../../../config');
const User = require('../../models/user');

const register = function (server, options) {

  server.route({
    method: 'GET',
    path: '/scoreDetails/',
    options: {
      auth: {
        strategies: ['session']
      }
    },
    handler: async function (request, h) {
      const user = await User.findById(request.query.id);

      return h.view('scoreDetails/index', {
        user: request.auth.credentials.user,
        projectName: Config.get('/projectName'),
        title: 'Score Details',
        baseUrl: Config.get('/baseUrl'),
        quizUser: user,
        quiz: request.query.quiz
      });
    }
  })
}

module.exports = {
  name: 'scoreDetails',
  dependencies: [
    'hapi-anchor-model',
    'auth'
  ],
  register
}
