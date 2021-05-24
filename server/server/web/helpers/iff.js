'use strict';

module.exports = (a, operator, b, opts) => {

  let bool = false;
  switch (operator) {
    	case '!=':
    	   bool = a != b;
    break;
  case '==':
    bool = a == b;
    break;
  case '>':
    bool = a > b;
    break;
  case '>=':
    bool = a >= b;
    break;
  case '<':
    bool = a < b;
    break;
  default:
    throw 'Unknown operator ' + operator;
  }

  if (bool) {
    return opts.fn(this);
  }
  return opts.inverse(this);

};


