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
          lastUpdated: new Date(),
          active:true
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
    path: '/api/score/{moduleId}',
    options: {
      auth: {
        strategies: ['session']
      }
    },
    handler: async function (request, h) {

      const questions =  Questions[parseInt(request.params.moduleId) - 1].questions;
      const id = request.auth.credentials.user._id.toString();
      const update = {
        $set: {
          quizCompleted: true
        }
      };

      const user = await User.findByIdAndUpdate(id, update);

      if (!user) {
        throw Boom.notFound('Document not found.');
      }

      let score = 0;
      const pipeline = [
        { $match : { userId : id, active: true,  questionId: { $in: questions.map((q) => q.id.toString()) } } },
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

  server.route({
    method: 'PUT',
    path: '/api/user-answer/active/{moduleId}',
    options: {
      auth: {
        strategies: ['session']
      },
      validate: {
        payload: {
          active: Joi.boolean().required()
        }
      }
    },
    handler: async function (request, h) {

      const questions =  Questions[parseInt(request.params.moduleId) - 1].questions;

      const filter = {
        userId: request.auth.credentials.user._id.toString(),
        questionId: { $in: questions.map((q) => q.id.toString()) }
      };
      const update = {
        $set: {
          active: request.payload.active
        }
      };

      const answers = await Answer.updateMany(filter, update);

      if (!answers) {
        throw Boom.notFound('Document not found.');
      }
      return answers;
    }
  });

  server.route({
    method: 'GET',
    path: '/api/user-answer/numQuestionAnswered/{moduleId}',
    options: {
      auth: {
        strategies: ['session']
      }
    },
    handler: async function (request, h) {

      const questions =  Questions[parseInt(request.params.moduleId) - 1].questions;
      const userId = request.auth.credentials.user._id.toString();

      const pipeline = [
        { $match : { userId, active: true,  questionId: { $in: questions.map((q) => q.id.toString()) } } },
        { $group: {
          _id: { questionId: '$questionId' }
        }
        }
      ];

      const answers = await Answer.aggregate(pipeline);

      if (!answers) {
        throw Boom.notFound('Document not found.');
      }
      return {
        'numQuestionsAnswered': answers.length,
        'numQuestions': questions.length
      };
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
