'use strict';

module.exports = (passed, choiceIndex, answerIndex, keyIndex = null) => {

  if (!passed && choiceIndex.toString() === answerIndex) {

    if (answerIndex !== keyIndex) {
      return 'form-check-label wrong';
    }
    else if (answerIndex === keyIndex) {
      return 'form-check-label right';
    }
  }
  else if (passed){

    if (answerIndex !== keyIndex && choiceIndex.toString() === answerIndex) {
      return 'form-check-label wrong';
    }
    else if (choiceIndex.toString() === keyIndex) {
      return 'form-check-label right';
    }
  }
  return 'form-check-label';
};
