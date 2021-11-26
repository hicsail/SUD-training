'use strict';
const Joi = require('joi');
const Boom = require('boom');
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
      
      const userId = request.auth.credentials.user._id.toString();
      let updatedAnswers = request.auth.credentials.user.answers;
      updatedAnswers[request.payload.questionId] = request.payload.answerIndex;

      const update = {
        $set: {
          answers: updatedAnswers
        }
      };

      await User.findByIdAndUpdate(userId, update);

      return updatedAnswers;
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
