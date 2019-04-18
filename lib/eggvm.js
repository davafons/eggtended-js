const fs = require('fs');

const {Parser} = require('./parse.js');
const {TopEnv} = require('./environment.js');
const {evaluate} = require('./registry.js');


class Eggvm {
  run(program) {
    const parser = new Parser();
    let tree = parser.parse(program);

    return this.eval(tree);
  }

  runFromFile(file) {
    const program = fs.readFileSync(file, 'utf8');
    return this.run(program);
  }

  runFromEVM(file) {
    const rawData = fs.readFileSync(file);
    let tree = JSON.parse(rawData);

    return this.eval(tree);
  }

  eval(tree, env) {
    // Create a new env if not already defined on parameters
    if(env === undefined || env === null) {
      env = Object.create(TopEnv);
    }

    return (tree !== null) ? evaluate(tree, env) : null;
  }
}

module.exports = {
  Eggvm
};
