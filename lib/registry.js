// specialForms and topEnv maps

const SpecialForms = new Map();

SpecialForms['evaluate'] = (expr, env) => {
  switch(expr.type) {
    case 'value':
      return expr.value;

    case 'word':
      if (expr.name in env) {
        return env[expr.name];
      } else {
        throw new ReferenceError(`Undefined variable: ${expr.name}`);
      }
      break;

    case 'apply':

      // Check if its a specialForm function
      if (expr.operator.type === 'word' && expr.operator.name in SpecialForms) {
        return SpecialForms[expr.operator.name](expr.args, env);
      }

      let op = SpecialForms.evaluate(expr.operator, env);
      if(typeof op != 'function') {
        throw new TypeError(`Applying a non-function`);
      }

      return op(...expr.args.map((arg) => SpecialForms.evaluate(arg, env)));
  }
};

SpecialForms['if'] = (args, env) => {
  if(args.length !== 3) {
    throw new SyntaxError('Bad number of args passed to if');
  }

  if(SpecialForms.evaluate(args[0], env) === true) {
    return SpecialForms.evaluate(args[1], env);
  } else {
    return SpecialForms.evaluate(args[2], env);
  }
};

SpecialForms['while'] = (args, env) => {
  if(args.length !== 2) {
    throw new SyntaxError('Bad number of args passed to while');
  }

  while(SpecialForms.evaluate(args[0], env) === true) {
    SpecialForms.evaluate(args[1], env);
  }

  // Egg has no undefined so we return false when there's no meaningful result
  return false;
};

SpecialForms['do'] = (args, env) => {
  let value = false;

  args.forEach((arg) => {
    value = SpecialForms.evaluate(arg, env);
  });

  return value;
};

SpecialForms['def'] = SpecialForms['define'] = SpecialForms[':='] = (args, env) => {
  if(args.length !== 2 || args[0].type !== 'word') {
    throw new SyntaxError('Bad use of define');
  }

  let value = SpecialForms.evaluate(args[1], env);
  env[args[0].name] = value;
  return value;
};

SpecialForms['fun'] = SpecialForms['->'] = (args, env) => {
  if (!args.length) {
    throw new SyntaxError('Functions need a body.');
  }

  function name(expr) {
    if (expr.type !== 'word') {
      throw new SyntaxError('Arg names must be words');
    }

    return expr.name;
  }

  let argNames = args.slice(0, args.length - 1).map(name);
  let body = args[args.length - 1];

  return function() {
    if (arguments.length !== argNames.length) {
      throw new TypeError('Wrong number of arguments');
    }

    let localEnv = Object.create(env);
    for (let i = 0; i < arguments.length; i++) {
      localEnv[argNames[i]] = arguments[i];
    }

    return SpecialForms.evaluate(body, localEnv);
  };
};

SpecialForms['set'] = SpecialForms['='] = (args, env) => {
  if (args[0].type !== 'word') {
    throw new SyntaxError('Bad use of set');
  }

  let valName = args[0].name;

  let indices = args.slice(1, args.length - 1).map((arg) =>
                      SpecialForms.evaluate(arg, env));

  let value = SpecialForms.evaluate(args[args.length - 1], env);

  for (let scope = env; scope; scope = Object.getPrototypeOf(scope)) {
    if (Object.prototype.hasOwnProperty.call(scope, valName)) {
      if(indices.length == 0) {
        scope[valName] = value;
      } else {
        let result = scope[valName];
        for(let i = 0; i < indices.length - 1; ++i) {
          let index = indices[i];

          if(index < 0) {
            index = result.length + index;
          }

          if(!Array.isArray(result)) {
            throw new TypeError(`Element in index (${indices}) is not an
            array!`);
          }

          if(index > result.length) {
            throw new RangeError(`Index ${index} is out of bounds. Array size:
            ${result.length}`);
          }

          result = result[index];
        }

        let index = indices[indices.length - 1];

        if(index < 0) {
          index = result.length + index;
        }

        if(!Array.isArray(result)) {
          throw new TypeError(`Element in index (${indices}) is not an
          array!`);
        }

        if(index > result.length) {
          throw new RangeError(`Index ${index} is out of bounds. Array size:
          ${result.length}`);
        }

        result[index] = value;
      }
      return value;
    }
  }

  throw new ReferenceError(`Tried setting an undefined variable: ${valName}`);
};

const TopEnv = new Map();

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
  TopEnv[op] = new Function('a, b', `return a ${op} b;`);
});

TopEnv['true'] = true;
TopEnv['false'] = false;

TopEnv['print'] = (value) => {
  console.log(value);
  return value;
};

TopEnv['arr'] = TopEnv['array'] = (...args) => {
  return args;
};

TopEnv['<-'] = TopEnv['[]'] = TopEnv['element'] = (array, ...indices) => {
  // Transform negative indices to positive equivalent

  let result = array;
  for(let i = 0; i < indices.length; ++i) {
    let index = indices[i];

    if(index < 0) {
      index = result.length + index;
    }

    if(!Array.isArray(result)) {
      throw new TypeError(`Element in index (${indices}) is not an
      array!`);
    }

    if(index > result.length) {
      throw new RangeError(`Index ${index} is out of bounds. Array size:
      ${result.length}`);
    }

    result = result[index];
  }

  return result;
};

TopEnv['length'] = (array) => {
  return array.length;
};

module.exports = {
  SpecialForms,
  TopEnv
};
