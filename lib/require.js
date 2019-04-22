const {TopEnv} = require('./environment.js');
const {Parser} = require('./parse.js');
const {evaluate} = require('./registry.js');

TopEnv['require'] = (file) => {
  if(!(file in TopEnv['require'].cache)) {
    const tree = Parser.parseFromFile(file);
    const env = Object.create(TopEnv);

    evaluate(tree, env);
    const module = {exports: env['exports']};

    TopEnv['require'].cache[file] = module;
  }

  return TopEnv['require'].cache[file].exports;
};

TopEnv['require'].cache = Object.create(null);

TopEnv['exports'] = {};
