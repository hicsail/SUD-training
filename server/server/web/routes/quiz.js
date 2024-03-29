'use strict';
const Config = require('../../../config');
const Questions = require('../../questions');
const User = require('../../models/user');
const Boom = require('boom');

const register = function (server, options) {

  server.route({
    method: 'GET',
    path: '/quiz/{moduleId}',
    options : {
      auth: {
        strategies: ['session']
      }
    },
    handler: async function (request, h) {

      //quiz questions on the module with moduleId passed in url
      const questions =  Questions[parseInt(request.params.moduleId) - 1].questions;
      const title = Questions[parseInt(request.params.moduleId) - 1].title;
      const numModules = 3;
      const maxIteration = numModules - 1;
      let score = 0;
      let questionsAnswered = 0;
      let passed = false;
      let submitBtnDisabled = true;
      let certificateEligible = true;
      let templateData = [];//metadata containing info about questions to be passed to template
      const userId = request.auth.credentials.user._id.toString();
      const user = await User.findById(userId);

      if (!user) {
        throw Boom.notFound('Document not found.');
      }

      let qs = [];
      for (let q of questions) {
        if (q.id)
          qs.push(q.id.toString());
      }

      const numQuestions = qs.length;

      //find most recent answers for each question
      const answers = user.answers;

      if (answers) {

        for (const q of questions) {

          const question = {'id': q.id, 'text': q.text, 'choices': q.choices, 'exp': q.exp, 'subexp': q['subexp']};

          if (q.id in answers) {
            question.answer = answers[q.id];
            questionsAnswered += 1;
            //increment score if user's answer is correct
            if (answers[q.id] === q.key) {
              score += 1;
            }
          }
          //attach the correct answer index to questions if user has completed quiz
          if (user.quizCompleted[request.params.moduleId].moduleCompleted) {
            question.keyIndex = q.key;
          }
          templateData.push(question);
        }

        //Enable submit button if all questions for this module are answered
        if (questionsAnswered === numQuestions) {
          submitBtnDisabled = false;
        }
      }
      else {
        templateData = questions;
      }

      if (!user.quizCompleted[request.params.moduleId].moduleCompleted) {
        score = null;
      }

      if ((score * 100) / numQuestions >= 80 ) {
        passed = true;
      }

      const nextModuleId = getNextModuleId(user, parseInt(request.params.moduleId), numModules, maxIteration);

      //Determine if user has passed all 3 quizes successfully
      for (const moduleId in user.quizCompleted) {
        if (!user.quizCompleted[moduleId].moduleCompleted || user.quizCompleted[moduleId].score < 80) {
          certificateEligible = false;
          break;
        }
      }

      let precentage = ((score / numQuestions) * 100);
      precentage = Number.isInteger(precentage) ? precentage : precentage.toFixed(2);

      return h.view('quiz/index', {
        questions: templateData,
        passed,
        submitBtnDisabled,
        certificateEligible,
        score,
        numQuestions,
        precentage,
        nextModuleId,
        moduleId: request.params.moduleId,
        quizCompleted: user.quizCompleted[request.params.moduleId].moduleCompleted,
        user: request.auth.credentials.user,
        projectName: Config.get('/projectName'),
        title: title,
        baseUrl: null
      });
    }
  });
};

const getNextModuleId = function (user, currentModuleId, numModules, maxIteration) {

  //find the smallest moduleId whose quiz is not completed
  for (let i = 1; i <= numModules; ++i) {
    if (!user.quizCompleted[i].moduleCompleted) {
      return i;
    }
  }
  //in case all quizes are completed, find the smallest moduleId whose quiz is failed
  for (let i = 1; i <= numModules; ++i) {
    if (!user.quizCompleted[i].score < 80) {
      return i;
    }
  }

  return -1;
};

module.exports = {
  name: 'quiz',
  dependencies: [
    'hapi-anchor-model',
    'auth'
  ],
  register
};
