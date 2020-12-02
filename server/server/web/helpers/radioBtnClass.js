'use strict';

module.exports = (choiceIndex, answerIndex, keyIndex = null) => {

  if (answerIndex !== keyIndex && choiceIndex.toString() === answerIndex) {
    return 'form-check-label wrong';
  }
  else if (choiceIndex.toString() === keyIndex) {
    return 'form-check-label right';
  }
  return 'form-check-label';
};
