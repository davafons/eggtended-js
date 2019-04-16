const {Parser} = require('./parse.js');
const {SpecialForms, TopEnv} = require('./registry.js');
const fs = require('fs');

class Eggvm {
  constructor() {
    this.specialForms = new SpecialForms(this);
  }

  run(program) {
    let env = new TopEnv();
    const parser = new Parser();
    let tree = parser.parse(program);

    return this.evaluate(tree, env);
  }

  runFromFile(file) {
    const program = fs.readFileSync(file, 'utf8');
    return this.run(program);
  }

  evaluate(expr, env) {
    switch(expr.type) {
      case 'value':
        console.log('value');
        return expr.value;

      case 'word':
        if (expr.name in env) {
          return env[expr.name];
        } else {
          throw new ReferenceError(`Undefined variable: ${expr.name}`);
        }
        console.log('word');
        break;

      case 'apply':
        console.log('apply');

        // Check if its a specialForm function
        if (expr.operator.type === 'word' && expr.operator.name in this.specialForms) {
          console.log('found SpecialForm');
          return this.specialForms[expr.operator.name](expr.args, env);
        }

        let op = this.evaluate(expr.operator, env);
        if(typeof op != 'function') {
          throw new TypeError(`Applying a non-function`);
        }

        return op(...expr.args.map((arg) => this.evaluate(arg, env)));
    }
  }
}

module.exports = {
  Eggvm
};
