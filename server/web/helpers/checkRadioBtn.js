'use strict';

module.exports = (choiceIndex, answerIndex) => { //this is a Block Helper

  return choiceIndex.toString() === answerIndex ?
    'checked' :
    '';
};
