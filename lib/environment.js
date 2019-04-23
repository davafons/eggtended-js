const xRegExp = require('xregexp');

const utils = require('./utils.js');

const TopEnv = Object.create(null);
[
  '+',
  '-',
  '*',
  '/',
  '==',
  '!=',
  '<',
  '>',
  '>=',
  '<=',
  '&&',
  '||'
].forEach((op) => {
  TopEnv[op] = new Function('a, b', `return a ${op} b;`);
});

TopEnv['true'] = true;
TopEnv['false'] = false;
TopEnv['null'] = null;

TopEnv['print'] = (value) => {
  console.log(value);
  return value;
};

TopEnv['arr'] = TopEnv['array'] = (...args) => {
  return args;
};

TopEnv['map'] = TopEnv['dict'] = (...args) => {
  return new Map(utils.chunk(args, 2));
};

TopEnv['<-'] = TopEnv['[]'] = TopEnv['element'] = (object, ...indices) => {
  return object.sub(...indices);
};

TopEnv['length'] = (array) => {
  return array.length;
};

TopEnv['RegExp'] = (method, ...args) => {
  return xRegExp[method](...args);
};

// WIP: Continue implementing class?
// TopEnv['new'] = (...args) => {
//   const className = args[0];
//
//   // TODO: Check for more exceptions
//   if(typeof className !== "function") {
//     throw new SyntaxError(`${className} must be a class with a constructor.`) // SyntaxError?
//   }
//
//   return new className(...args.slice(1));
// }

module.exports = {
  TopEnv
};
