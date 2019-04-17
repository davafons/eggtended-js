// specialForms and topEnv maps
const SpecialForms = new Map();
const TopEnv = new Map();

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

    case 'apply':

      // Check if its a specialForm function
      if (expr.operator.type === 'word' && expr.operator.name in SpecialForms) {
        return SpecialForms[expr.operator.name](expr.args, env);
      }

      // Evaluated operator
      let op = SpecialForms.evaluate(expr.operator, env);
      // Evaluated arguments
      let evArgs = expr.args.map((arg) => SpecialForms.evaluate(arg, env));

      if(typeof op === 'object' || typeof op === 'string') {
        let methodName = evArgs[0];
        return op[methodName](...evArgs.slice(1));
      }

      if(typeof op === 'function') {
        return op(...evArgs);
      }

      throw new TypeError(`Could not resolve the apply expression`);
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
      if(indices.length === 0) {
        scope[valName] = value;

      } else {
        // Iterate through the indices, returning a reference to the last array
        let array = TopEnv.element(scope[valName], ...indices.slice(0,
          indices.length - 1));

        // Modify the value on the last array
        let lastIndex = TopEnv._getValidIndexFrom(array, indices[indices.length - 1]);
        array[lastIndex] = value;
      }
      return value;
    }
  }

  throw new ReferenceError(`Tried setting an undefined variable: ${valName}`);
};

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
  let result = array;

  // Iterate through all indices, moving to the inner arrays
  indices.forEach((index) => {
    index = TopEnv._getValidIndexFrom(array, index);
    result = result[index];
  });

  return result;
};

TopEnv['length'] = (array) => {
  return array.length;
};

TopEnv._getValidIndexFrom = (array, index) => {
  if (index < 0) {
    index = array.length + index;
  }

  if(!Array.isArray(array)) {
    throw new TypeError(`Element in index (${index}) of ${array} is not an
    array!`);
  }

  if(index > array.length) {
    throw new RangeError(`Index ${index} is out of bounds. Array size:
    ${array.length}`);
  }

  return index;
};

module.exports = {
  SpecialForms,
  TopEnv
};
