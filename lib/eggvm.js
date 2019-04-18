const {Parser} = require('./parse.js');
const {TopEnv, evaluate} = require('./registry.js');
const fs = require('fs');

class Eggvm {
  run(program) {
    const parser = new Parser();

    let env = Object.create(TopEnv);
    let tree = parser.parse(program);

    return evaluate(tree, env);
  }

  runFromFile(file) {
    const program = fs.readFileSync(file, 'utf8');
    return this.run(program);
  }

  runFromEVM(file) {
    const rawData = fs.readFileSync(file);

    let env = Object.create(TopEnv);
    let tree = JSON.parse(rawData);

    return evaluate(tree, env);
  }
}

module.exports = {
  Eggvm
};
