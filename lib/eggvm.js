const {Parser} = require('./parse.js')
const {SpecialForms} = require("./registry.js");

class Evaluator {
  constructor() {
    this.parser = new Parser();
    this.specialForms = new SpecialForms(this);
  }

  run(program) {
    let env = new Map;
    let tree = this.parser.parse(program);
    return this.evaluate(tree, env);
  }

  evaluate(expr, env) {
    switch(expr.type) {
      case 'value':
        console.log("value");
        return expr.value;

      case 'word':
        if (expr.name in env) {
          return env[expr.name];
        } else {
          throw new ReferenceError(`Undefined variable: ${expr.name}`)
        }
        console.log("word");
        break;

      case 'apply':
        console.log("apply");

        // Check if its a specialForm function
        if (expr.operator.type === 'word' && expr.operator.name in this.specialForms) {
          return this.specialForms[expr.operator.name](expr.args, env);
        }

        let op = this.evaluate(expr.operator, env);
        if(typeof op != "function") {
          throw new TypeError(`Applying a non-function`);
        }

        return op(...expr.args.map((arg) => this.evaluate(arg, env)));
    }
  }
}

module.exports = {
  Evaluator
}
