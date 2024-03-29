'use strict';
const Config = require('../../../config');
const Questions = require('../../questions');
const User = require('../../models/user');

const register = function (server, options) {

  server.route({
    method: 'GET',
    path: '/scoreDetails/{userId}/{moduleId}',
    options: {
      auth: {
        strategies: ['session']
      }
    },
    handler: async function (request, h) {
      const user = await User.findById(request.params.userId);
      const questions = Questions[parseInt(request.params.moduleId) - 1].questions;
      const answers = user.answers;
      const templateData = [];
      for (const q of questions) {
        const question = { 'id': q.id, 'text': q.text, 'choices': q.choices, 'exp': q.exp, 'subexp': q['subexp'] };
        if (q.id in answers) {
          question.answer = answers[q.id];
        }

        question.keyIndex = q.key;
        templateData.push(question);
      }
      const score = user.quizCompleted[request.params.moduleId].score

      return h.view('scoreDetails/index', {
        user: request.auth.credentials.user,
        projectName: Config.get('/projectName'),
        title: 'Score Details',
        baseUrl: Config.get('/baseUrl'),
        quizUser: user,
        quiz: request.params.moduleId,
        score,
        pass: (score >= 80 ? true : false),
        questions: templateData,
        quiz1Completed: user.quizCompleted[1].moduleCompleted,
        quiz2Completed: user.quizCompleted[2].moduleCompleted,
        quiz3Completed: user.quizCompleted[3].moduleCompleted
      });
    }
  });
};

module.exports = {
  name: 'scoreDetails',
  dependencies: [
    'hapi-anchor-model',
    'auth'
  ],
  register
};
