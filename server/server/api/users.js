'use strict';
const Questions = require('../questions');
const Boom = require('boom');
const GroupAdmin = require('../models/group-admin');
const User = require('../models/user');
const Answer = require('../models/answer');
const Config = require('../../config');
const Joi = require('joi');
const PasswordComplexity = require('joi-password-complexity');
const Math = require('mathjs');

const register = function (server, options) {

  server.route({
    method: 'GET',
    path: '/api/select2/users',
    options: {
      auth: {
        strategies: ['simple', 'session']
      },
      validate: {
        query: {
          term: Joi.string(),
          _type: Joi.string(),
          q: Joi.string()
        }
      }
    },
    handler: async function (request, h) {

      const query = {
        $or: [
          { email: { $regex: request.query.term, $options: 'i' } },
          { name: { $regex: request.query.term, $options: 'i' } },
          { username: { $regex: request.query.term, $options: 'i' } }
        ]

      };

      const limit = 25;
      const page = 1;

      const users = await User.pagedFind(query, page, limit);

      return ({
        results: users.data,
        pagination: {
          more: users.pages.hasNext
        }
      });
    }
  });

  server.route({
    method: 'POST',
    path: '/api/users',
    options: {
      auth: {
        strategies: ['simple', 'session'],
        scope: ['root','admin','researcher']
      },
      validate: {
        payload: User.payload
      },
      pre: [
        {
          assign: 'usernameCheck',
          method: async function (request, h) {

            const conditions = {
              username: request.payload.username
            };

            const user = await User.findOne(conditions);

            if (user) {
              throw Boom.conflict('Username already in use.');
            }

            return h.continue;
          }
        }, {
          assign: 'emailCheck',
          method: async function (request, h) {

            const conditions = {
              email: request.payload.email
            };

            const user = await User.findOne(conditions);

            if (user) {
              throw Boom.conflict('Email already in use.');
            }

            return h.continue;
          }
        }, {
          assign: 'passwordCheck',
          method: async function (request, h) {

            const complexityOptions = Config.get('/passwordComplexity');

            try {
              await Joi.validate(request.payload.password, new PasswordComplexity(complexityOptions));
            }
            catch (err) {
              throw Boom.conflict('Password does not meet complexity standards');
            }

            return h.continue;
          }
        }]
    },
    handler: async function (request, h) {

      const username = request.payload.username;
      const password = request.payload.password;
      const email = request.payload.email;
      const name = request.payload.name;

      const user = await User.create(username, password, email, name);

      return user;
    }
  });


  server.route({
    method: 'PUT',
    path: '/api/users/{id}',
    options: {
      auth: {
        strategies: ['simple', 'session'],
        scope: 'admin'
      },
      validate: {
        params: {
          id: Joi.string().invalid('000000000000000000000000')
        },
        payload: {
          username: Joi.string().token().lowercase().required(),
          email: Joi.string().email().lowercase().required(),
          name: Joi.string().required()
        }
      },
      pre: [
        {
          assign: 'usernameCheck',
          method: async function (request, h) {

            const conditions = {
              username: request.payload.username,
              _id: { $ne: User._idClass(request.params.id) }
            };

            const user = await User.findOne(conditions);

            if (user) {
              throw Boom.conflict('Username already in use.');
            }

            return h.continue;
          }
        }, {
          assign: 'emailCheck',
          method: async function (request, h) {

            const conditions = {
              email: request.payload.email,
              _id: { $ne: User._idClass(request.params.id) }
            };

            const user = await User.findOne(conditions);

            if (user) {
              throw Boom.conflict('Email already in use.');
            }

            return h.continue;
          }
        }
      ]
    },
    handler: async function (request, h) {

      const id = request.params.id.toString();
      const update = {
        $set: {
          name: request.payload.name,
          username: request.payload.username,
          email: request.payload.email
        }
      };

      const user = await User.findByIdAndUpdate(id, update);

      if (!user) {
        throw Boom.notFound('Document not found.');
      }

      return user;
    }
  });

  server.route({
    method: 'PUT',
    path: '/api/users/{id}/participation',
    options: {
      auth: {
        strategies: ['simple', 'session'],
        scope: ['root', 'admin', 'researcher']
      },
      validate: {
        params: {
          id: Joi.string().invalid('000000000000000000000000')
        },
        payload: {
          inStudy: Joi.boolean().required(),
          studyID: Joi.number().required()
        }
      }
    },
    handler: function (request, h) {

      const id = request.params.id;
      const update = {
        $set: {
          inStudy: request.payload.inStudy,
          studyID: request.payload.studyID
        }
      };

      const user = User.findByIdAndUpdate(id, update);

      if (!user) {
        throw Boom.notFound('Document not found.');
      }

      return user;
    }
  });


  server.route({
    method: 'PUT',
    path: '/api/users/my',
    options: {
      auth: {
        strategies: ['simple', 'session']
      },
      validate: {
        payload: {
          email: Joi.string().email().lowercase().required(),
          firstname: Joi.string().required(),
          lastname: Joi.string().required()
        }
      },
      pre: [{
        assign: 'emailCheck',
        method: async function (request, h) {

          const conditions = {
            email: request.payload.email,
            _id: { $ne: request.auth.credentials.user._id }
          };

          const user = await User.findOne(conditions);

          if (user) {
            throw Boom.conflict('Email already in use.');
          }

          return h.continue;
        }
      }
      ]
    },
    handler: async function (request, h) {

      const id = request.auth.credentials.user._id.toString();
      const update = {
        $set: {
          email: request.payload.email,
          firstname: request.payload.firstname,
          lastname: request.payload.lastname
        }
      };

      const user = await User.findByIdAndUpdate(id, update);

      return user;
    }
  });


  server.route({
    method: 'PUT',
    path: '/api/users/{id}/password',
    options: {
      auth: {
        strategies: ['simple','session'],
        scope: ['root','admin']
      },
      validate: {
        params: {
          id: Joi.string().invalid('000000000000000000000000')
        },
        payload: {
          password: Joi.string().required()
        }
      },
      pre: [
        {
          assign: 'password',
          method: function (request, h) {

            const hash = User.generatePasswordHash(request.payload.password);

            return hash;
          }
        },{
          assign: 'passwordCheck',
          method: async function (request, h) {

            const complexityOptions = Config.get('/passwordComplexity');

            try {
              await Joi.validate(request.payload.password, new PasswordComplexity(complexityOptions));
            }
            catch (err) {

              throw Boom.conflict('Password does not meet complexity standards');
            }

            return h.continue;
          }
        },{
          assign: 'scopeCheck',
          method: async function (request, h) {

            const id = request.params.id;
            const role = User.highestRole(request.auth.credentials.user.roles);

            const user = await User.findById(id);

            if (!user) {
              throw Boom.notFound('User not found.');
            }

            const userRole = User.highestRole(user.roles);
            if (role > userRole) {
              return true;
            }


            throw Boom.unauthorized('User does not have permission to update this users password');

          }
        }
      ]
    },
    handler: async function (request, h) {

      const id = request.params.id;
      const update = {
        $set: {
          password: request.pre.password.hash
        }
      };

      const user = await User.findByIdAndUpdate(id, update);

      if (!user) {

        throw Boom.notFound('User not found.');
      }

      return user;
    }
  });


  server.route({
    method: 'PUT',
    path: '/api/users/my/password',
    options: {
      auth: {
        strategies: ['simple', 'session']
      },
      validate: {
        payload: {
          password: Joi.string().required()
        }
      },
      pre: [{
        assign: 'password',
        method: async function (request, h) {

          const hash = await User.generatePasswordHash(request.payload.password);

          return hash;
        }
      },{
        assign: 'passwordCheck',
        method: async function (request, h) {

          const complexityOptions = Config.get('/passwordComplexity');

          try {
            await Joi.validate(request.payload.password, new PasswordComplexity(complexityOptions));
          }
          catch (err) {

            throw Boom.conflict('Password does not meet complexity standards');
          }

          return h.continue;
        }
      }]
    },
    handler: async function (request, h) {

      const id = request.auth.credentials.user._id.toString();
      const update = {
        $set: {
          password: request.pre.password.hash
        }
      };

      const user = await User.findByIdAndUpdate(id, update);

      return user;
    }
  });


  server.route({
    method: 'DELETE',
    path: '/api/users/{id}',
    options: {
      auth: {
        strategies: ['simple', 'session'],
        scope: ['root', 'admin']
      },
      validate: {
        params: {
          id: Joi.string().invalid('000000000000000000000000')
        }
      }
    },
    handler: async function (request, h) {

      const user = await User.findByIdAndDelete(request.params.id);

      if (!user) {
        throw Boom.notFound('Document not found.');
      }

      return ({ message: 'Success.' });

    }
  });

  server.route({
    method: 'PUT',
    path: '/api/users/trainingCompleted/{id}',
    options: {
      auth: {
        strategies: ['simple', 'session']
      },
      validate: {
        payload: {
          trainingCompleted: Joi.boolean().required()
        }
      }
    },
    handler: async function (request, h) {

      const id = request.params.id;
      const update = {
        $set: {
          trainingCompleted: request.payload.trainingCompleted
        }
      };

      const user = await User.findByIdAndUpdate(id, update);

      if (!user) {
        throw Boom.notFound('Document not found.');
      }

      return user;
    }
  });

  //to be called when either a submit or retake on quiz page happens
  server.route({
    method: 'PUT',
    path: '/api/users/quizCompleted/{userId}/{moduleId}',
    options: {
      auth: {
        strategies: ['simple', 'session']
      },
      validate: {
        payload: {
          quizCompleted: Joi.boolean().required()
        }
      }
    },
    handler: async function (request, h) {

      const userId = request.params.userId;
      const user = await User.findById(userId);
      let score = 0;

      if (!user) {
        throw Boom.notFound('Document not found.');
      }

      //Compute score if a submit is happening
      if (request.payload.quizCompleted === true) {
        //quiz questions on the module with moduleId passed in url
        const questions =  Questions[parseInt(request.params.moduleId) - 1].questions;

        //grab the question ids (ignore the explanatory items)
        let questionIds = [];
        for (let q of questions) {
          if (q.id)
            questionIds.push(q.id.toString());
        }

        //the most recent sessionId for each question might be different.
        const pipeline = [
          { $match : { userId, active: true, questionId: { $in:  questionIds } } },
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

          for (const q of questions) {
            if (q.id in hashData) {
              //increment score if user's answer is correct
              if (hashData[q.id] === q.key) {
                score += 1;
              }
            }
          }
        }
        else {
          score = 0;
        }
        //Compute precentage score
        score = (score * 100) / questionIds.length;
      }

      const quizCompleted = user.quizCompleted;
      quizCompleted[request.params.moduleId].moduleCompleted = request.payload.quizCompleted;
      quizCompleted[request.params.moduleId].score = score.toFixed(2);

      const update = {
        $set: {
          quizCompleted
        }
      };

      await User.findByIdAndUpdate(userId, update);

      return user;
    }
  });

  //For calculating number of users who have passed, failed and completed a quiz
  server.route({
    method: 'GET',
    path: '/api/users/quizCompleted/counts/{moduleId?}',
    options: {
      auth: {
        strategies: ['simple', 'session']
      }
    },
    handler: async function (request, h) {

      const numUsers = await User.count({});
      const counts = {};

      if (request.params.moduleId) {

        const moduleId = request.params.moduleId;

        const filter = {};
        const cond1 = 'quizCompleted.'  + moduleId + '.score';
        const cond2 = 'quizCompleted.'  + moduleId + '.moduleCompleted';

        //Calculate number of users who completed the quiz for module
        filter[cond2] = true;
        counts.numCompleted = await User.count(filter);

        //Calculate number of users who failed the quiz for module
        filter[cond1] = { $lt: 80 };
        counts.numFailed = await User.count(filter);

        //Calculate number of users who successfully completed the quiz for module
        counts.numPassed = counts.numCompleted - counts.numFailed;
        counts.numNotCompleted = numUsers - counts.numCompleted;
        delete counts.numCompleted;

      }
      else {

        const filter = {
          'quizCompleted.1.moduleCompleted' : true,
          'quizCompleted.2.moduleCompleted' : true,
          'quizCompleted.3.moduleCompleted' : true
        };

        counts.numCompleted = await User.count(filter);

        filter.$or = [
          { 'quizCompleted.1.score': { $lt: 80 } },
          { 'quizCompleted.2.score': { $lt: 80 } },
          { 'quizCompleted.3.score': { $lt: 80 } }
        ];
        counts.numFailed = await User.count(filter);

        counts.numPassed = counts.numCompleted - counts.numFailed;
        counts.numNotCompleted = numUsers - counts.numCompleted;
        delete counts.numCompleted;
      }
      return counts;
    }
  });

  //For calculating number of users who have passed, failed and completed a quiz
  server.route({
    method: 'GET',
    path: '/api/users/quizCompleted/summaryStatistics',
    options: {
      auth: {
        strategies: ['simple', 'session']
      }
    },
    handler: async function (request, h) {

      const scores = [];
      const moduleIds = ['1', '2', '3'];

      for (const moduleId of moduleIds) {

        const filter = {};
        const cond = 'quizCompleted.'  + moduleId + '.moduleCompleted';

        //Calculate number of users who completed the quiz for module
        filter[cond] = true;
        const users = await User.find(filter);
        const scoreList = users.map((user) => user.quizCompleted[moduleId].score);

        scores.push(scoreList);
      }
      
      const result = [
        { 'group': 'mean', '1': 0, '2': 0, '3': 0 },
        { 'group': 'median', '1': 0, '2': 0, '3': 0 },
        { 'group': 'min', '1': 0, '2': 0, '3': 0 },
        { 'group': 'max', '1': 0, '2': 0, '3': 0 }
      ];
      for (const i in scores) {
        result[0][moduleIds[i]] = Math.mean(scores[i]);
        result[1][moduleIds[i]] = Math.median(scores[i]);
        result[2][moduleIds[i]] = Math.min(scores[i]);
        result[3][moduleIds[i]] = Math.max(scores[i]);
      }
      
      return result;
    }
  });

  server.route({
    method: 'PUT',
    path: '/api/users/{role}/{id}',
    options: {
      auth: {
        strategies: ['simple', 'jwt', 'session']
      },
      validate: {
        params: {
          id: Joi.string().invalid('000000000000000000000000'),
          role: Joi.string().valid(...(Config.get('/roles').map((role) => {

            return role.name;
          })))
        }
      },
      pre: [{
        assign: 'canChangeRoles',
        method: function (request, h){

          return h.continue;
          /*User.highestRole(request.auth.credentials.user.roles) >= User.highestRole({ [request.params.role]: true }) ?
            reply(true) :
            reply(Boom.conflict('Unable to promote a higher access level than your own'));*/
        }
      },{
        assign: 'notYou',
        method: function (request, h) {

          if (request.auth.credentials.user._id === request.params.id) {
            throw Boom.conflict('Unable to promote yourself.');
          }

          return h.continue;
        }
      },{
        assign: 'user',
        method: async function (request, h) {

          const findOptions = {
            fields: User.fieldsAdapter('username roles')
          };

          const user = await User.findById(request.params.id, findOptions);

          if (!user) {
            throw Boom.notFound('User not found to promote.');
          }

          return user;
        }
      }]
    },
    handler: async function (request, h) {

      const user = request.pre.user;
      const role = Config.get('/roles').find((elem) => elem.name === request.params.role);

      if (role.type  === 'groupAdmin') {
        user.roles[request.params.role] = GroupAdmin.create([]);
      }
      else {
        user.roles[request.params.role] = true;
      }

      const update = {
        $set: {
          roles: user.roles
        }
      };

      const updatedUser = await User.findByIdAndUpdate(request.params.id, update);

      return {
        _id: updatedUser._id,
        username: updatedUser.username,
        roles: updatedUser.roles
      };
    }
  });

  server.route({
    method: 'DELETE',
    path: '/api/users/{role}/{id}',
    options: {
      auth: {
        strategies: ['simple', 'jwt', 'session']
      },
      validate: {
        params: {
          id: Joi.string().invalid('000000000000000000000000'),
          role: Joi.string().valid(...(Config.get('/roles').map((role) => {

            return role.name;
          })))
        }
      },
      pre: [{
        assign: 'canChangeRoles',
        method: function (request, h){

          return h.continue;
          /*User.highestRole(request.auth.credentials.user.roles) >= User.highestRole({ [request.params.role]: true }) ?
            reply(true) :
            reply(Boom.conflict('Unable to demote a higher access level than your own'));*/
        }
      },{
        assign: 'notYou',
        method: function (request, h) {

          if (request.auth.credentials.user._id === request.params.id) {
            throw Boom.conflict('Unable to demote yourself.');
          }

          return h.continue;
        }
      },{
        assign: 'user',
        method: async function (request, h) {

          const findOptions = {
            fields: User.fieldsAdapter('username roles')
          };

          const user = await User.findById(request.params.id, findOptions);

          if (!user) {
            throw Boom.notFound('User not found to promote');
          }
          return user;
        }
      }]
    },
    handler: async function (request, h) {

      const user = request.pre.user;

      delete user.roles[request.params.role];

      const update = {
        $set: {
          roles: user.roles
        }
      };

      const updatedUser = await User.findByIdAndUpdate(request.params.id, update);

      return {
        _id: updatedUser._id,
        username: updatedUser.username,
        roles: updatedUser.roles
      };
    }
  });
};

module.exports = {
  name: 'users',
  dependencies: [
    'hapi-anchor-model',
    'auth'
  ],
  register
};
