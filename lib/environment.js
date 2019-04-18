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
  '&&',
  '||'
].forEach((op) => {
  TopEnv[op] = new Function('a, b', `return a ${op} b;`);
});

TopEnv['true'] = true;
TopEnv['false'] = false;

TopEnv['print'] = (value) => {
  console.log(value);
  return value;
};

TopEnv['arr'] = TopEnv['array'] = (...args) => {
  return args;
};

TopEnv['map'] = TopEnv['dict'] = (...args) => {
  return new Map(utils._chunk(args, 2));
};

TopEnv['<-'] = TopEnv['[]'] = TopEnv['element'] = (object, ...indices) => {
  return object.sub(...indices);
};

TopEnv['length'] = (array) => {
  return array.length;
};

module.exports = {
  TopEnv
};
