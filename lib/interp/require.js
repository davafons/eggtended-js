const {TopEnv} = require('./environment.js');
const {Parser} = require('../parser/parse.js');

TopEnv['require'] = (file) => {
  if(!(file in TopEnv['require'].cache)) {
    const tree = Parser.parseFromFile(file);
    const env = Object.create(TopEnv);

    tree.evaluate(env);

    const module = {exports: env['module'].exports};

    TopEnv['require'].cache[file] = module;
  }

  return TopEnv['require'].cache[file].exports;
};

TopEnv['require'].cache = Object.create(null);
TopEnv['module'] = {exports: {}};
