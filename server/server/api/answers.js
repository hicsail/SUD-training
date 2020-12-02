'use strict';
const Joi = require('joi');
const Boom = require('boom');
const Answer = require('../models/answer');
const User = require('../models/user');
const Questions = require('../questions');

const register  = function (server, options) {

  server.route({
    method: 'POST',
    path: '/api/update/user-answer',
    options: {
      auth: {
        strategies: ['session']
      },
      validate: {
        payload: {
          questionId: Joi.string().required(),
          answerIndex: Joi.string().required()
        }
      }
    },
    handler: async function (request, h) {

      let answer = null;

      const filter = {
        userId: request.auth.credentials.user._id.toString(),
        sessionId: request.auth.credentials.session._id.toString(),
        questionId: request.payload.questionId
      };

      const update = {
        $set: {
          answerIndex: request.payload.answerIndex,
          lastUpdated: new Date()
        }
      };

      answer = await Answer.findOneAndUpdate(filter, update);

      request.payload.sessionId = request.auth.credentials.session._id.toString();
      request.payload.userId = request.auth.credentials.user._id.toString();
      if (!answer) {
        answer = await Answer.create(request.payload);
      }

      return answer;
    }
  });

  server.route({
    method: 'GET',
    path: '/api/score',
    options: {
      auth: {
        strategies: ['session']
      }
    },
    handler: async function (request, h) {

      const id = request.auth.credentials.user._id.toString();
      const update = {
        $set: {
          quizCompleted: true
        }
      };

      const user = User.findByIdAndUpdate(id, update);

      if (!user) {
        throw Boom.notFound('Document not found.');
      }

      let score = 0;
      const pipeline = [
        { $match : { userId : request.auth.credentials.user._id.toString() } },
        { $sort:{ lastUpdated : -1 } },
        { $group: {
          _id: { questionId: '$questionId' },
          answerIndex: { $first : '$answerIndex' },
          questionId: { $first : '$questionId' }
        } }
      ];
      const mostRecentAnswers = await Answer.aggregate(pipeline);

      const hashData = {};
      for (const answer of mostRecentAnswers) {
        hashData[answer.questionId] = answer.answerIndex;
      }

      for (const q of Questions) {
        if (q.id in hashData && hashData[q.id] === q.key) {
          score += 1;
        }
      }
      return score;
    }
  });
};

module.exports = {
  name: 'answers',
  dependencies: [
    'hapi-anchor-model',
    'auth'
  ],
  register
};
