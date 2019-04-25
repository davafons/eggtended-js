const {SpecialForms} = require('./environment.js');

const {Value} = require('./ast.js');

SpecialForms['++'] = (args, env) => {
  if(args.length !== 1) {
    throw new SyntaxError('Bad use of ++');
  }

  return incrementHelper(args[0], env, 1);
};

SpecialForms['--'] = (args, env) => {
  if(args.length !== 1) {
    throw new SyntaxError('Bad use of --');
  }

  return incrementHelper(args[0], env, -1);
};

SpecialForms['+='] = (args, env) => {
  if(args.length !== 2) {
    throw new SyntaxError('Bad use of +=');
  }

  const inc = args[1].evaluate(env);

  return incrementHelper(args[0], env, inc);
};

SpecialForms['-='] = (args, env) => {
  if(args.length !== 2) {
    throw new SyntaxError('Bad use of -=');
  }

  const inc = args[1].evaluate(env);

  return incrementHelper(args[0], env, -inc);
};

const incrementHelper = (variable, env, inc) => {
  const varValue = variable.evaluate(env);

  const token = {type: 'value', value: varValue + inc};
  const newValue = new Value(token);

  return SpecialForms['set']([variable, newValue], env);
};
