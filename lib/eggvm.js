let {Parser} = require('./parse.js')

class Evaluator {
  constructor() {
    this.parser = new Parser();

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
        break;
    }

  }
}

e = new Evaluator();
