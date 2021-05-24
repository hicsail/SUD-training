'use strict';
const Answer = require('../models/answer');
const User = require('../models/user');
const Questions = require('../questions');

const register  = function (server, options) {

  server.route({
    method: 'GET',
    path: '/api/questions/analysis',
    options: {
      auth: {
        strategies: ['session']
      }
    },
    handler: async function (request, h) {

      const response = {};
      for (let moduleId = 1; moduleId <= 3; ++moduleId) {

        const questions =  Questions[moduleId - 1].questions;          
        
        const field = 'quizCompleted.' + moduleId + '.moduleCompleted';
        const filter = {};
        filter[field] = true;
        const users = await User.find(filter);
        //create list of userId who have completed quiz for module Id
        const userIds = users.map( (user) => user._id.toString() );

        //grab list of questions (ignore the explanatory items in array)        
        let qs = []
        for (let q of questions) {
          if (q.id)
            qs.push(q)
        }

        //create list of questionsId
        const questionIds = qs.map((q) => q.id.toString());

        //the most recent sessionId for each question might be different.
        const pipeline = [
          { $match : { active: true, userId: { $in: userIds }, questionId: { $in: questionIds } } },
          { $sort:{ lastUpdated : -1 } },
          { $group: {
            _id: { questionId: '$questionId', userId: '$userId' },
            answerIndex: { $first : '$answerIndex' }
          } }
        ];
        //find most recent answers for each question
        const mostRecentAnswers = await Answer.aggregate(pipeline);

        const dict = {};
        for (const answer of mostRecentAnswers) {

          const qId = answer._id.questionId;
          const answerIndex = answer.answerIndex;

          if (qId in dict) {
            dict[qId].userCounts += 1;
            const index = qs.findIndex((q) => q.id.toString() === qId);
            if (answerIndex.toString() === qs[index].key) {
              dict[qId].correctAnswers += 1;
            }
          }
          else {
            dict[qId] = { 'userCounts': 1, 'correctAnswers': 0 };
            const index = qs.findIndex((q) => q.id.toString() === qId);
            if (answerIndex.toString() === qs[index].key) {
              dict[qId].correctAnswers += 1;
            }
          }
        }

        const result = [];
        for (const key in dict) {
          //let rec = [key, dict[key]['userCounts'], dict[key]['correctAnswers']];
          const rec = { 'group': key, 'value': dict[key].correctAnswers };
          result.push(rec);
        }
        response[moduleId] = result;
      }      
      return (response);
    }
  });
};

module.exports = {
  name: 'questions',
  dependencies: [
    'hapi-anchor-model',
    'auth'
  ],
  register
};
