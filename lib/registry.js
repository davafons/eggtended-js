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

  while(args, env) {
    if(args.length != 2) {
      throw new SyntaxError('Bad number of args passed to while');
    }

    while(this.evaluate(args[0], env) === true) {
      this.evaluate(args[1], env);
    }

    // Egg has no undefined so we return false when there's no meaningful result
    return false;
  }

  do(args, env) {
    let value = false;

    args.forEach((arg) => {
      value = this.evaluate(arg, env) ;
    });

    return value;
  }

  def(args, env) {
    return this.define(args, env);
  }

  define(args, env) {
    if(args.length != 2 || args[0].type != 'word') {
      throw new SyntaxError('Bad use of define');
    }

    let value = this.evaluate(args[1], env);
    env[args[0].name] = value;
    return value;
  }
}


class TopEnv { }
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
  TopEnv.prototype[op] = new Function('a, b', `return a ${op} b;`);
});

TopEnv.prototype['true'] = true;
TopEnv.prototype['false'] = false;


module.exports = {
  SpecialForms,
  TopEnv
}

