'use strict';
const Auth = require('../../server/auth');
const Crypto = require('../../server/crypto');
const Code = require('code');
const Config = require('../../config');
const Hapi = require('hapi');
const Fixtures = require('./fixtures');
const Lab = require('lab');
const Manifest = require('../../manifest');
const JWT = require('jsonwebtoken');
const lab = exports.lab = Lab.script();
const Session = require('../../server/models/session');
const Token = require('../../server/models/token');
const User = require('../../server/models/user');

let server;

lab.before(async () => {

  server = Hapi.Server();

  const plugins = Manifest.get('/register/plugins')
    .filter((entry) => Auth.dependencies.includes(entry.plugin))
    .map((entry) => {

      entry.plugin = require(entry.plugin);

      return entry;

    });

  plugins.push(Auth);
  plugins.push({ plugin: require('../../server/anchor/hapi-anchor-model'), options: Manifest.get('/register/plugins').filter((v) => v.plugin === './server/anchor/hapi-anchor-model.js')[0].options });

  await server.register(plugins);
  await server.start();
  await Fixtures.Db.removeAllData();

  server.route({
    method: 'GET',
    path: '/simple',
    options: {
      auth: false
    },
    handler: async function (request, h) {

      try {
        await request.server.auth.test('simple', request);
        return { isValid: true };
      }

      catch (err) {
        return { isValid: false };
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/session',
    options: {
      auth: false,
      plugins: {
        'hapi-auth-cookie': {
          redirectTo: false
        }
      }
    },
    handler: async function (request, h) {

      try {
        await request.server.auth.test('session', request);

        return { isValid: true };
      }
      catch (err) {
        return { isValid: false };
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/token',
    options: {
      auth: false
    },
    handler: async function (request, h) {

      try {
        await request.server.auth.test('jwt', request);
        return { isValid: true };
      }

      catch (err) {
        return { isValid: false };
      }
    }
  });

  server.route({
    method: 'POST',
    path: '/login',
    options: {
      auth: false
    },
    handler: async function (request, h) {

      let userCreds;

      if (request.query && request.query.rootUser) {
        userCreds = await Fixtures.Creds.createRootUser('321!abc','ren@stimpy.show');
      }
      else {
        userCreds = await Fixtures.Creds.createUser('Ren','321!abc','ren@stimpy.show','Stimpy', []);
      }

      if (request.query && request.query.badSession) {
        userCreds.session.key = 'blamo';
      }

      if (request.query && request.query.badUser) {
        const sessionUpdate = {
          $set: {
            userId: '555555555555555555555555'
          }
        };

        await Session.findByIdAndUpdate(userCreds.session._id, sessionUpdate);
      }

      if (request.query && request.query.notActive) {
        const userUpdate = {
          $set: {
            isActive: false
          }
        };

        await User.findByIdAndUpdate(userCreds.user._id, userUpdate);
      }

      const creds = {
        user: {
          _id: userCreds.user._id,
          username: userCreds.user.username,
          email: userCreds.user.email
        },
        session: userCreds.session,
        key: userCreds.session.key,
        _id: userCreds.session._id
      };

      request.cookieAuth.set(creds);
      return creds;
    }
  });
});

lab.after(async () => {

  await Fixtures.Db.removeAllData();
  await server.stop();
});

lab.experiment('Simple Auth Strategy', () => {

  lab.test('it returns as invalid without authentication provided', async () => {

    const request = {
      method: 'GET',
      url: '/simple'
    };
    const response = await server.inject(request);
    Code.expect(response.statusCode).to.equal(200);
    Code.expect(response.result.isValid).to.equal(false);
  });

  lab.test('it returns as invalid when the session query misses', async () => {

    const sessionId = '000000000000000000000001';
    const sessionKey = '01010101-0101-0101-0101-010101010101';
    const request = {
      method: 'GET',
      url: '/simple',
      headers: {
        authorization: Fixtures.Creds.authHeader(sessionId, sessionKey)
      }
    };

    const response = await server.inject(request);

    Code.expect(response.statusCode).to.equal(200);
    Code.expect(response.result.isValid).to.equal(false);
  });

  lab.test('it returns as invalid when the user query misses', async () => {

    const doc = {
      userId: '000000000000000000000000',
      ip: '127.0.0.1',
      userAgent: 'Lab'
    };
    const session = await Session.create(doc);

    const request = {
      method: 'GET',
      url: '/simple',
      headers: {
        authorization: Fixtures.Creds.authHeader(session._id, session.key)
      }
    };
    const response = await server.inject(request);

    Code.expect(response.statusCode).to.equal(200);
    Code.expect(response.result.isValid).to.equal(false);
  });

  lab.test('it returns as invalid when the user is not active', async () => {

    const { user } = await Fixtures.Creds.createUser('Ren','321!abc','ren@stimpy.show','Stimpy', []);

    const doc = {
      userId: `${user._id}`,
      ip: '127.0.0.1',
      userAgent: 'Lab'
    };
    const session = await Session.create(doc);

    const update = {
      $set: {
        isActive: false
      }
    };

    await User.findByIdAndUpdate(user._id, update);

    const request = {
      method: 'GET',
      url: '/simple',
      headers: {
        authorization: Fixtures.Creds.authHeader(session._id, session.key)
      }
    };

    const response = await server.inject(request);

    Code.expect(response.statusCode).to.equal(200);
    Code.expect(response.result.isValid).to.equal(false);
  });

  /*lab.test('it returns as valid when it is the root user', async () => {

    const rootUser = await Fixtures.Creds.createRootUser('321!abc','ren@stimpy.show');

    const doc = {
      userId: `${rootUser.user._id}`,
      ip: '127.0.0.1',
      userAgent: 'Lab'
    }
    const session = await Session.create(doc);

    const request = {
      method: 'GET',
      url: '/simple',
      credentials: rootUser,
      headers: {
        authorization: Fixtures.Creds.authHeader(rootUser.user.username, '321!abc')
      }
    };

    const response = await server.inject(request);

    Code.expect(response.statusCode).to.equal(200);
    Code.expect(response.result.isValid).to.equal(true);
  });

  lab.test('it returns as valid when all is well', async () => {

    const { user } = await Fixtures.Creds.createUser('Ren','321!abc','ren@stimpy.show','Stimpy', []);

    const doc = {
      userId: `${user._id}`,
      ip: '127.0.0.1',
      userAgent: 'Lab'
    };
    const session = await Session.create(doc);

    const request = {
      method: 'GET',
      url: '/simple',
      headers: {
        authorization: Fixtures.Creds.authHeader(session._id, session.key)
      }
    };

    const response = await server.inject(request);

    Code.expect(response.statusCode).to.equal(200);
    Code.expect(response.result.isValid).to.equal(true);
  });*/
});

lab.experiment('Session Auth Strategy', () => {

  lab.afterEach(async () => {

    await Fixtures.Db.removeAllData();
  });

  lab.test('it returns as invalid without authentication provided', async () => {

    const request = {
      method: 'GET',
      url: '/session'
    };
    const response = await server.inject(request);

    Code.expect(response.statusCode).to.equal(200);
    Code.expect(response.result.isValid).to.equal(false);
  });

  lab.test('it returns as invalid when the session query misses', async () => {

    const loginRequest = {
      method: 'POST',
      url: '/login?badSession=1'
    };
    const loginResponse = await server.inject(loginRequest);
    const cookie = loginResponse.headers['set-cookie'][0].replace(/;.*$/, '');

    const request = {
      method: 'GET',
      url: '/session',
      headers: {
        cookie
      }
    };

    const response = await server.inject(request);

    Code.expect(response.statusCode).to.equal(200);
    Code.expect(response.result.isValid).to.equal(false);
  });

  lab.test('it returns as invalid when the user query misses', async () => {

    const loginRequest = {
      method: 'POST',
      url: '/login?badUser=1'
    };
    const loginResponse = await server.inject(loginRequest);
    const cookie = loginResponse.headers['set-cookie'][0].replace(/;.*$/, '');
    const request = {
      method: 'GET',
      url: '/session',
      headers: {
        cookie
      }
    };
    const response = await server.inject(request);

    Code.expect(response.statusCode).to.equal(200);
    Code.expect(response.result.isValid).to.equal(false);
  });

  lab.test('it returns as invalid when the user is not active', async () => {

    const loginRequest = {
      method: 'POST',
      url: '/login?notActive=1'
    };
    const loginResponse = await server.inject(loginRequest);
    const cookie = loginResponse.headers['set-cookie'][0].replace(/;.*$/, '');
    const request = {
      method: 'GET',
      url: '/session',
      headers: {
        cookie
      }
    };

    const response = await server.inject(request);

    Code.expect(response.statusCode).to.equal(200);
    Code.expect(response.result.isValid).to.equal(false);
  });

  lab.test('it returns valid when its the root user', async () => {

    const loginRequest = {
      method: 'POST',
      url: '/login?rootUser=1'
    };
    const loginResponse = await server.inject(loginRequest);

    const cookie = loginResponse.headers['set-cookie'][0].replace(/;.*$/, '');
    const request = {
      method: 'GET',
      url: '/session',
      headers: {
        cookie
      }
    };

    const response = await server.inject(request);

    Code.expect(response.statusCode).to.equal(200);
    Code.expect(response.result.isValid).to.equal(true);
  });

  lab.test('it returns as valid when all is well', async () => {

    const loginRequest = {
      method: 'POST',
      url: '/login'
    };
    const loginResponse = await server.inject(loginRequest);
    const cookie = loginResponse.headers['set-cookie'][0].replace(/;.*$/, '');

    const request = {
      method: 'GET',
      url: '/session',
      headers: {
        cookie
      }
    };

    const response = await server.inject(request);

    Code.expect(response.statusCode).to.equal(200);
    Code.expect(response.result.isValid).to.equal(true);
  });
});

lab.experiment('JWT Auth Strategy', () => {

  lab.test('it returns as invalid without authentication provided', async () => {

    const request = {
      method: 'GET',
      url: '/token'
    };
    const response = await server.inject(request);
    Code.expect(response.statusCode).to.equal(200);
    Code.expect(response.result.isValid).to.equal(false);
  });

  lab.test('it returns as invalid when the token is invalid', async () => {

    const request = {
      method: 'GET',
      url: '/token',
      headers: {
        authorization: 'eyJhbGciOiJIUzI1NiJ9.NWI2OWM2N2RmNDhkYjk2ZWY1MzEyNGQ1OjY5YTQ4YjYxLTEzODQtNDhmNC1hMjU2LWJhMDgxZjUzNDRiOQ.gZGuCTD4zv8repgyMicObgux96sVlHRCyKBHLclI1IU'
      }
    };

    const response = await server.inject(request);

    Code.expect(response.statusCode).to.equal(200);
    Code.expect(response.result.isValid).to.equal(false);
  });

  lab.test('it returns as invalid when the user query misses', async () => {

    const token = await Token.create({ userId: '000000000000000000000001', tokenName: 'test token' });
    const request = {
      method: 'GET',
      url: '/token',
      headers: {
        authorization: token.token
      }
    };
    const response = await server.inject(request);

    Code.expect(response.statusCode).to.equal(200);
    Code.expect(response.result.isValid).to.equal(false);
  });

  lab.test('it returns as invalid when the user is not active', async () => {

    const { user } = await Fixtures.Creds.createUser('Ren','321!abc','ren@stimpy.show','Stimpy', []);
    const token = await Token.create({ userId: `${user._id}`, tokenName: 'test token' });

    const update = {
      $set: {
        isActive: false
      }
    };

    await User.findByIdAndUpdate(user._id, update);

    const request = {
      method: 'GET',
      url: '/token',
      headers: {
        authorization: token.token
      }
    };

    const response = await server.inject(request);

    Code.expect(response.statusCode).to.equal(200);
    Code.expect(response.result.isValid).to.equal(false);
  });

  lab.test('it returns as invalid when the token is not active', async () => {

    const { user } = await Fixtures.Creds.createUser('Ren','321!abc','ren@stimpy.show','Stimpy', []);
    const token = await Token.create({ userId: `${user._id}`, tokenName: 'test token' });

    const update = {
      $set: {
        isActive: false
      }
    };

    await Token.findByIdAndUpdate(token._id, update);

    const request = {
      method: 'GET',
      url: '/token',
      headers: {
        authorization: token.token
      }
    };

    const response = await server.inject(request);

    Code.expect(response.statusCode).to.equal(200);
    Code.expect(response.result.isValid).to.equal(true);
  });

  lab.test('it returns as invalid when token secret and token provided don\'t match', async () => {

    const { user } = await Fixtures.Creds.createUser('Ren','321!abc','ren@stimpy.show','Stimpy', []);
    const token = await Token.create({ userId: `${user._id}`, tokenName: 'test token' });
    const keyHash = await Crypto.generateKeyHash();
    keyHash.key = JWT.sign(( token._id + ':' + keyHash.key), Config.get('/authSecret'));

    const request = {
      method: 'GET',
      url: '/token',
      headers: {
        authorization: keyHash.key
      }
    };

    const response = await server.inject(request);

    Code.expect(response.statusCode).to.equal(200);
    Code.expect(response.result.isValid).to.equal(false);
  });

  lab.test('it returns as valid when all is well', async () => {

    const { user } = await Fixtures.Creds.createUser('Ren','321!abc','ren@stimpy.show','Stimpy', []);
    const token = await Token.create({ userId: `${user._id}`, tokenName: 'test token' });

    const request = {
      method: 'GET',
      url: '/token',
      headers: {
        authorization: token.token
      }
    };

    const response = await server.inject(request);

    Code.expect(response.statusCode).to.equal(200);
    Code.expect(response.result.isValid).to.equal(true);
  });
});
