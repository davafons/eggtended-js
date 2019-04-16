const {Parser} = require('./parse.js');
const {SpecialForms, TopEnv} = require('./registry.js');
const fs = require('fs');

class Eggvm {
  run(program) {
    let env = new TopEnv();
    const parser = new Parser();
    let tree = parser.parse(program);

    return SpecialForms.evaluate(tree, env);
  }

  runFromFile(file) {
    const program = fs.readFileSync(file, 'utf8');
    return this.run(program);
  }
}

module.exports = {
  Eggvm
};
