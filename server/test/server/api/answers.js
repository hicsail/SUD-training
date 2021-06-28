'use strict';

const AnchorApi = require('../../../server/anchor/anchor-api');
const Auth = require('../../../server/auth');
const Code = require('code');
const Fixtures = require('../fixtures');
const Hapi = require('hapi');
const Lab = require('lab');
const Manifest = require('../../../manifest');
const User = require('../../../server/models/user');
const AnswerApi = require('../../../server/api/answers');
const HapiAuthBasic = require('hapi-auth-basic');
const HapiAuthCookie = require('hapi-auth-cookie');
const HapiAuthJWT = require('hapi-auth-jwt2');


const lab = exports.lab = Lab.script();
let server;
let authenticatedRoot;
let testUser;

lab.before(async () => {

  server = Hapi.Server();

  const plugins = Manifest.get('/register/plugins')
    .filter((entry) => AnswerApi.dependencies.includes(entry.plugin))
    .map((entry) => {

      entry.plugin = require(entry.plugin);

      return entry;
    });

  plugins.push({ plugin: require('../../../server/anchor/hapi-anchor-model'), options: Manifest.get('/register/plugins').filter((v) => v.plugin === './server/anchor/hapi-anchor-model.js')[0].options });
  plugins.push(HapiAuthBasic);
  plugins.push(HapiAuthCookie);
  plugins.push(HapiAuthJWT);
  plugins.push(Auth);
  plugins.push(AnchorApi);
  plugins.push(AnswerApi);

  await server.register(plugins);
  await server.start();
  await Fixtures.Db.removeAllData();

  authenticatedRoot = await Fixtures.Creds.createRootUser('123abs','email@email.com');
  testUser = await User.create('ren', 'baddog', 'ren@stimpy.show', 'ren');
});

lab.after(async () => {

  await Fixtures.Db.removeAllData();
  await server.stop();
});

lab.experiment('POST /api/update/user-answer', () => {

  let request;
  lab.beforeEach(() => {

    request = {
      method: 'POST',
      url: '/api/update/user-answer',
      credentials: { user: testUser },
      headers: {
        authorization: Fixtures.Creds.authHeader(authenticatedRoot.session._id, authenticatedRoot.session.key)
      }
    };
  });

  lab.afterEach(() => {
    const update = { answers: { '1': '0', '2': '3', '10': '1' } };
    User.findByIdAndUpdate(testUser._id, update);
  });

  lab.test('it returns HTTP 200 when all is well', async () => {

    request.payload = {
      questionId: '5',
      answerIndex: '2'
    };

    const response = await server.inject(request);
    Code.expect(response.statusCode).to.equal(200);
    Code.expect(response.result).to.be.an.object();
    Code.expect(response.result['5']).to.be.equal('2');
  });

});

lab.experiment('GET /api/user-answer/numQuestionAnswered/{moduleId}', () => {

  let request;

  lab.beforeEach(() => {
    request = {
      method: 'GET',
      url: '/api/user-answer/numQuestionAnswered/{moduleId}',
      credentials: { user: testUser },
      headers: {
        authorization: Fixtures.Creds.authHeader(authenticatedRoot.session._id, authenticatedRoot.session.key)
      }
    };
  });

  lab.test('it returns HTTP 200 when all is well', async () => {

    request.url = '/api/user-answer/numQuestionAnswered/1';
    const response = await server.inject(request);
    Code.expect(response.statusCode).to.equal(200);
    Code.expect(response.result.numQuestionsAnswered).to.equal(3);
    Code.expect(response.result.numQuestions).to.equal(11);
  });

  lab.test('it returns HTTP 404 when User.findById misses', async () => {
    request.url = '/api/user-answer/numQuestionAnswered/1';
    request.credentials = { user: { _id: '555555555555555555555555' } };
    const response = await server.inject(request);
    Code.expect(response.statusCode).to.equal(404);
    Code.expect(response.result.message).to.match(/not found/);
  });
});
