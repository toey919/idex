'use strict';

const { assign } = Object;
const sprintf = require('sprintf');

const errors = {
  '1': 'Order not found',
  '2': 'Trade signature invalid',
  '3': 'Token buyer has insufficient funds',
  '4': 'Token seller has insufficient funds',
  '5': 'Order signature invalid',
  '6': 'Withdrawal signature invalid',
  '7': 'Insufficient balance for withdrawal',
  '8': 'Cancel signature invalid',
  '9': 'Order cannot be filled by this many units',
  '10': 'Nonce too low',
  '11': 'Can\'t cancel someone else\'s order',
  '12': 'Withdrawal signature invalid',
  '13': 'Cannot withdraw over your balance'
};

const apiErrors = {
  '1': '%s',
  '2': 'Method "%s" not found'
};

const APIError = (code, ...args) => {
  if (!apiErrors[code]) throw Error('Error code ' + code + ' not found');
  const retval = Error(sprintf(apiErrors[code], ...args));
  retval.name = 'APIError';
  retval.code = code;
  delete retval.stack;
  return retval;
};

const TradeError = (code) => {
  if (!errors[code]) throw Error('Error code ' + code + ' not found');
  const retval = Error(errors[code]);
  retval.name = 'TradeError';
  retval.code = code;
  delete retval.stack;
  return retval;
};

const errorFromCode = (code) => TradeError(code);

const serializableFromError = (err) => {
  const { 
    code,
    name,
    message,
    stack
  } = err;
  return assign({}, {
    code,
    name,
    stack,
    error: true,
    message
  });
};

assign(module.exports, {
  errors,
  APIError,
  TradeError,
  errorFromCode,
  serializableFromError
});
