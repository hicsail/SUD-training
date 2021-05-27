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

      //let user = null;

      const userId = request.auth.credentials.user._id.toString();
      let updatedAnswers = request.auth.credentials.user.answers;
      updatedAnswers[request.payload.questionId] = request.payload.answerIndex;

      const update = {
        $set: {
          answers: updatedAnswers
        }
      };

      const user = await User.findByIdAndUpdate(userId, update);

      return user;
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
      let qs = [];
      for (let q of questions) {
        if (q.id)
          qs.push(q.id.toString());
      }
      const pipeline = [
        { $match : { userId : id, active: true,  questionId: { $in: qs } } },
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
      let qs = [];
      for (let q of questions) {
        if (q.id)
          qs.push(q.id.toString());
      }
      const filter = {
        userId: request.auth.credentials.user._id.toString(),
        questionId: { $in: qs }
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
      let qs = [];
      for (let q of questions) {
        if (q.id)
          qs.push(q.id.toString());
      }

      const user = await User.findById(userId);

      if (!user) {
        throw Boom.notFound('Document not found.');
      }

      const userAnswers = Object.keys(user.answers);
      const answers = userAnswers.filter(key => { return qs.indexOf(key) !== -1 });

      return {
        'numQuestionsAnswered': answers.length,
        'numQuestions': qs.length
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
