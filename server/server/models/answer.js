'use strict';
const Assert = require('assert');
const Joi = require('joi');
const AnchorModel = require('../anchor/anchor-model');

class Answer extends AnchorModel {

  static async create(doc) {

    Assert.ok(doc.userId, 'Missing userId argument.');
    Assert.ok(doc.questionId, 'Missing questionId argument.');
    Assert.ok(doc.sessionId, 'Missing sessionId argument.');
    Assert.ok(doc.answerIndex, 'Missing answerIndex argument.');

    const document = {
      userId: doc.userId,
      questionId: doc.questionId,
      sessionId: doc.sessionId,
      answerIndex: doc.answerIndex,
      active: true,
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    const answers = await this.insertOne(document);

    return answers[0];
  }
}

Answer.collectionName = 'answers';

Answer.schema = Joi.object({
  _id: Joi.object(),
  active: Joi.boolean().default(true).required(),
  userId: Joi.string().required(),
  sessionId: Joi.string().required(),
  answerIndex: Joi.number().required(),
  questionId:  Joi.number().required(),
  createdAt: Joi.date().required(),
  lastUpdated: Joi.date().required()
});

Answer.indexes = [
  { key: { userId: 1, questionId: 1 } }
];

module.exports = Answer;
