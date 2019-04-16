// specialForms and topEnv maps

class SpecialForms {
  constructor(evaluator) {
    this.evaluator = evaluator;
  }

  do(args, env) {
    let value = false;

    args.forEach((arg) => {
      value = this.evaluator.evaluate(arg, env) ;
    });

    return value;
  }
}

module.exports = {
  SpecialForms
}
