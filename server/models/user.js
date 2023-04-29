'use strict';
const Assert = require('assert');
const Crypto = require('../crypto');
const GroupAdmin = require('./group-admin');
const Joi = require('joi');
const Hoek = require('hoek');
const AnchorModel = require('../anchor/anchor-model');
const Config = require('../../config');

const getRolesValidator = function () {

  const roles = {};

  Config.get('/roles').forEach((role) => {

    if (role.type === 'groupAdmin') {
      roles[role.name] = GroupAdmin.schema;
    }
    else {
      roles[role.name] = Joi.boolean();
    }
  });
  return roles;
};

class User extends AnchorModel {
  static async generatePasswordHash(password) {

    Assert.ok(password, 'Missing pasword arugment.');
    const salt = await Crypto.genSalt(10);
    const hash = await Crypto.hash(password,salt);

    return { password, hash };
  }

  static async create(firstname, lastname, email, password) {

    Assert.ok(password, 'Missing pasword arugment.');
    Assert.ok(email, 'Missing email arugment.');
    Assert.ok(firstname, 'Missing firstname arugment.');
    Assert.ok(lastname, 'Missing lastname arugment.');

    const self = this;

    const passwordHash = await this.generatePasswordHash(password);
    const document =  new this({
      password: passwordHash.hash,
      email: email.toLowerCase(),
      firstname,
      lastname,
      roles: {},
      isActive: true,
      trainingCompleted: false,
      quizCompleted: {
        '1': { moduleCompleted:false, score: 0 },
        '2': { moduleCompleted:false, score: 0 },
        '3': { moduleCompleted:false, score: 0 }
      },
      answers: {},
      timeCreated: new Date()
    });

    const users = await self.insertOne(document);

    users[0].password = passwordHash.password;

    return users[0];
  }

  static async findByCredentials(email, password) {

    const self = this;

    Assert.ok(email,'Missing email argument.');
    Assert.ok(password,'Missing password argument.');

    const query = { isActive: true };

    if (email.indexOf('@') > -1) {
      query.email = email;
    }

    const user = await self.findOne(query);

    if (!user) {
      return;
    }

    const passwordMatch = await Crypto.compare(password,user.password);

    if (passwordMatch) {
      return user;
    }
  }

  /*static async findByUsername(username) {

    Assert.ok(username, 'Misisng username argument.');

    const query = { username: username.toLowerCase() };

    return await this.findOne(query);
  }*/

  static async findByEmail(email) {

    Assert.ok(email, 'Misisng email argument.');

    const query = { email: email.toLowerCase() };

    return await this.findOne(query);
  }

  static highestRole(roles) {

    let maxAccessLevel = 0;
    const roleDict = {};

    Config.get('/roles').forEach((roleObj) => {

      roleDict[roleObj.name] = roleObj.accessLevel;
    });

    for (const role in roles) {

      if (roleDict[role] >= maxAccessLevel) {
        maxAccessLevel = roleDict[role];
      }
    }

    return maxAccessLevel;
  }

  constructor(attrs) {

    super(attrs);

    Object.defineProperty(this, '_roles', {
      writable: true,
      enumerable: false
    });
  }

  static PHI() {

    return ['username', 'password', 'name', 'email'];
  }
}


User.collectionName = 'users';


User.schema = Joi.object({
  _id: Joi.object(),
  isActive: Joi.boolean().default(true),
  trainingCompleted: Joi.boolean().default(false),
  quizCompleted: Joi.object({
    1: Joi.object({
      moduleCompleted: Joi.boolean().default(false).required(),
      score: Joi.number()
    }).required(),
    2: Joi.object({
      moduleCompleted: Joi.boolean().default(false).required(),
      score: Joi.number()
    }).required(),
    3: Joi.object({
      moduleCompleted: Joi.boolean().default(false).required(),
      score: Joi.number()
    }).required()
  }),
  password: Joi.string(),
  firstname: Joi.string(),
  lastname: Joi.string(),
  email: Joi.string().email().lowercase().required(),
  roles: Joi.object(getRolesValidator()),
  resetPassword: Joi.object({
    token: Joi.string().required(),
    expires: Joi.date().required()
  }),
  answers: Joi.object().pattern(/^[1-9][0-9]*$/, [Joi.string()]),
  timeCreated: Joi.date()
});

User.payload = Joi.object({
  password: Joi.string().required(),
  emailaddress: Joi.string().email().lowercase().required(),
  firstname: Joi.string().required(),
  lastname: Joi.string().required()
});

User.routes = Hoek.applyToDefaults(AnchorModel.routes, {
  create: {
    disabled: true,
    payload: User.payload
  },
  update: {
    disabled: true,
    payload: User.payload
  },
  getMy: {
    disabled: true
  },
  delete:{
    disabled: true
  },
  insertMany: {
    payload: User.payload
  },
  tableView: {
    disabled: true
  }
});

User.indexes = [
  { key: { email: 1, unique: 1 } }
];

module.exports = User;
