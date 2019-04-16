// specialForms and topEnv maps

class SpecialForms {
  constructor(evaluator) {
    this.evaluator = evaluator;
  }

  evaluate(arg, env) {
    return this.evaluator.evaluate(arg, env);
  }

  if(args, env) {
    if(args.length != 3) {
      throw new SyntaxError('Bad number of args passed to if');
    }

    let returnv = this.evaluate(args[0], env);
    console.log("retaurv: " + returnv);

    if(this.evaluate(args[0], env) === true) {
      console.log("TAd")
      return this.evaluate(args[1], env);
    } else {
      console.log("FASD")
      return this.evaluate(args[2], env);
    }
  }

  do(args, env) {
    let value = false;

    args.forEach((arg) => {
      value = this.evaluate(arg, env) ;
    });

    return value;
  }
}


class TopEnv {
  constructor() {
    this.true = true;
    this.false = false;
  }
}

let env = new TopEnv();

console.log(env['true']);

module.exports = {
  SpecialForms,
  TopEnv
}

