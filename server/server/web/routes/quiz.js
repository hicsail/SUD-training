'use strict';
const Config = require('../../../config');
const Questions = require('../../questions');
const Answer = require('../../models/answer');
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
      const numModules = 3;
      const maxIteration = numModules - 1;
      let score = 0;
      let passed = false;
      let submitBtnDisabled = true;
      let certificateEligible = true;
      let templateData = [];//metadata containing info about questions to be passed to template
      const userId = request.auth.credentials.user._id.toString();
      const user = await User.findById(userId);

      if (!user) {
        throw Boom.notFound('Document not found.');
      }
      //the most recent sessionId for each question might be different.
      const pipeline = [
        { $match : { userId, active: true, questionId: { $in: questions.map((q) => q.id.toString()) } } },
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

        //Enable submit button if all questions are answered
        if (mostRecentAnswers.length === questions.length) {
          submitBtnDisabled = false;
        }
        //hash most recent answers with questionIds as keys and answerIndex as value
        const hashData = {};
        for (const answer of mostRecentAnswers) {
          hashData[answer.questionId] = answer.answerIndex;
        }

        for (const q of questions) {
          const question = { 'id': q.id, 'text': q.text, 'choices': q.choices };
          if (q.id in hashData) {
            question.answer = hashData[q.id];
            //increment score if user's answer is correct
            if (hashData[q.id] === q.key) {
              score += 1;
            }
          }
          //attach the correct answer index to questions if user has completed quiz
          if (user.quizCompleted[request.params.moduleId].moduleCompleted) {
            question.keyIndex = q.key;
          }
          templateData.push(question);
        }
      }
      else {
        templateData = questions;
      }

      if (!user.quizCompleted[request.params.moduleId].moduleCompleted) {
        score = null;
      }

      if ((score * 100) / questions.length >= 80 ) {
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

      return h.view('quiz/index', {
        questions: templateData,
        passed,
        submitBtnDisabled,
        certificateEligible,
        score,
        nextModuleId,
        moduleId: request.params.moduleId,
        quizCompleted: user.quizCompleted[request.params.moduleId].moduleCompleted,
        user: request.auth.credentials.user,
        projectName: Config.get('/projectName'),
        title: 'Quiz',
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

  /*//Compute id of next module whose quiz should be taken by user
  let nextModuleId = ( currentModuleId % numModules ) + 1;
  let nextModuleFound = false;

  //not completed quized are high priority
  for (let i = 0; i < maxIteration; i++) {
    if (!user.quizCompleted[nextModuleId]['moduleCompleted']) {
      nextModuleFound = true;
      break;
    }
    else {
      nextModuleId = ( nextModuleId  % numModules) + 1;
    }
  }

  if (!nextModuleFound) {
    for (let i = 0;i < maxIteration; i++) {
      //Next module must be a failed one
      if (user.quizCompleted[nextModuleId]['score'] < 80 ) {
        nextModuleFound = true;
        break;
      }
      else {
        nextModuleId = ( nextModuleId  % numModules) + 1;
      }
    }
  }
  return nextModuleId; */
};

module.exports = {
  name: 'quiz',
  dependencies: [
    'hapi-anchor-model',
    'auth'
  ],
  register
};
