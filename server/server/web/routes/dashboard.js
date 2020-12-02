'use strict';
const Config = require('../../../config');
const Questions = require('../../questions');
const Answer = require('../../models/answer');
const User = require('../../models/user');
const Boom = require('boom');

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

      return h.view('dashboard/index', {
        user: request.auth.credentials.user,
        trainingCompleted: request.auth.credentials.user.trainingCompleted,
        projectName: Config.get('/projectName'),
        title: 'Dashboard',
        baseUrl: Config.get('/baseUrl')
      });
    }
  });

  server.route({
    method: 'GET',
    path: '/dashboard/quiz',
    options : {
      auth: {
        strategies: ['session']
      }
    },
    handler: async function (request, h) {

      if (!request.auth.credentials.user.trainingCompleted) {
        throw Boom.badRequest('Traning not completed.');
      }

      let score = 0;
      let questions = [];//metadata containing info about questions to be passed to template
      const userId = request.auth.credentials.user._id.toString();
      const user = await User.findById(userId);

      if (!user) {
        throw Boom.notFound('Document not found.');
      }

      const pipeline = [
        { $match : { userId } },
        { $sort:{ lastUpdated : -1 } },
        { $group: {
          _id: { questionId: '$questionId' },
          answerIndex: { $first : '$answerIndex' },
          lastUpdated: { $first : '$lastUpdated' },
          questionId: { $first : '$questionId' }
        } }
      ];
      //find most recent answers for each question
      const mostRecentAnswers = await Answer.aggregate(pipeline);

      if (mostRecentAnswers.length !== 0) {
        //hash most recent answers with questionIds as keys and answerIndex as value
        const hashData = {};
        for (const answer of mostRecentAnswers) {
          hashData[answer.questionId] = answer.answerIndex;
        }

        for (const q of Questions) {
          const question = { 'id': q.id, 'text': q.text, 'choices': q.choices };
          if (q.id in hashData) {
            question.answer = hashData[q.id];
            //increment score if user's answer is correct
            if (hashData[q.id] === q.key) {
              score += 1;
            }
          }
          //attach the correct answer index to questions if user has completed quiz
          if (user.quizCompleted) {
            question.keyIndex = q.key;
          }
          questions.push(question);
        }
      }
      else {
        questions = Questions;
      }

      if (!user.quizCompleted) {
        score = null;
      }
      return h.view('dashboard/quiz', {
        questions,
        score,
        user: request.auth.credentials.user,
        projectName: Config.get('/projectName'),
        title: 'Dashboard',
        baseUrl: null
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
