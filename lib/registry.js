// Add monkey-patching functions
require('./monkey-patching.js');

// specialForms and topEnv maps
const SpecialForms = new Map();
const TopEnv = new Map();

const inspect = require('util').inspect;
const ins = (x) => inspect(x, {depth: 'null'});


function evaluate(expr, env) {
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
      let op = evaluate(expr.operator, env);
      // Evaluated arguments
      let evArgs = expr.args.map((arg) => evaluate(arg, env));

      if(typeof op === 'object' || typeof op === 'string' || typeof op === 'number') {
        let name = evArgs[0];

        // Check if the name of the method/property is defined on the object
        if(typeof op[name] !== 'undefined') {
          // Execute as function
          if(typeof op[name] === 'function') {
            return op[name](...evArgs.slice(1));

          // Return as property
          } else {
            return op[name];
          }

        // If the name of the method is not defined on the object...
        } else {
          // Try to call the 'missing' method
          if(typeof op['__missing__'] === 'function') {
            return op['__missing__'](...evArgs.slice(1));

          // As a last resort, throw an Exception
          } else {
            throw new SyntaxError(`The method '${name}' was not found on the object '${op}'`);
          }
        }
      }

      if(typeof op === 'function') {
        return op(...evArgs);
      }

      throw new TypeError(`Could not resolve the apply expression`);
  }
}

SpecialForms['if'] = (args, env) => {
  if(args.length !== 3) {
    throw new SyntaxError('Bad number of args passed to if');
  }

  if(evaluate(args[0], env) === true) {
    return evaluate(args[1], env);
  } else {
    return evaluate(args[2], env);
  }
};

SpecialForms['while'] = (args, env) => {
  if(args.length !== 2) {
    throw new SyntaxError('Bad number of args passed to while');
  }

  while(evaluate(args[0], env) === true) {
    evaluate(args[1], env);
  }

  // Egg has no undefined so we return false when there's no meaningful result
  return false;
};

SpecialForms['do'] = (args, env) => {
  let value = false;

  args.forEach((arg) => {
    value = evaluate(arg, env);
  });

  return value;
};

SpecialForms['def'] = SpecialForms['define'] = SpecialForms[':='] = (args, env) => {
  if(args.length !== 2 || args[0].type !== 'word') {
    throw new SyntaxError('Bad use of define');
  }

  let value = evaluate(args[1], env);
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

    return evaluate(body, localEnv);
  };
};

SpecialForms['set'] = SpecialForms['='] = (args, env) => {
  if (args[0].type !== 'word') {
    throw new SyntaxError('Bad use of set');
  }

  let valName = args[0].name;

  let indices = args.slice(1, -1).map((arg) =>
                      evaluate(arg, env));

  let value = evaluate(args[args.length - 1], env);

  for (let scope = env; scope; scope = Object.getPrototypeOf(scope)) {
    if (Object.prototype.hasOwnProperty.call(scope, valName)) {

      if(indices.length === 0) {
        scope[valName] = value;
      } else {
        scope[valName].setelem(value, ...indices)
      }

      return value;
    }
  }

  throw new ReferenceError(`Tried setting an undefined variable: ${valName}`);
};

SpecialForms['object'] = (args, env) => {
  // Create a new object and a new scope
  const object = {}
  const objectEnv = Object.create(env);

  // Add the variable 'this' as a reference to the current object
  objectEnv['this'] = object;

  // Evaluate the arguments and add the methods/properties to the object
  const evArgs = args.map((arg) => evaluate(arg, objectEnv));

  for(const pair of _chunk(evArgs, 2)) {
    const name = pair[0];
    const value = pair[1];

    object[name] = value;
  }

  return object;
}

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

TopEnv['map'] = TopEnv['dict'] = (...args) => {
  return new Map(_chunk(args, 2));
}

TopEnv['<-'] = TopEnv['[]'] = TopEnv['element'] = (object, ...indices) => {
  return object.sub(...indices);
};

TopEnv['length'] = (array) => {
  return array.length;
};


function *_chunk(arr, step) {
  for(let i = 0; i < arr.length; i += step) {
    yield arr.slice(i, i+step);
  }
}

module.exports = {
  SpecialForms,
  TopEnv,
  evaluate
};
