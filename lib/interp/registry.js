const xRegExp = require("xregexp");

const utils = require("../utils.js");

const { SymbolTable } = require("./symboltable.js");

// specialForms and topEnv maps
const SpecialForms = Object.create(null);
const TopEnv = Object.create(null);

SpecialForms["if"] = (args, env) => {
  if (args.length !== 3) {
    throw new SyntaxError("Bad number of args passed to if");
  }

  if (args[0].evaluate(env) === true) {
    return args[1].evaluate(env);
  } else {
    return args[2].evaluate(env);
  }
};

SpecialForms["while"] = (args, env) => {
  if (args.length !== 2) {
    throw new SyntaxError("Bad number of args passed to while");
  }

  while (args[0].evaluate(env) === true) {
    args[1].evaluate(env);
  }

  // Egg has no undefined so we return false when there's no meaningful result
  return false;
};

SpecialForms["for"] = (args, env) => {
  if (args.length !== 4) {
    throw new SyntaxError("Bad number of args passed to for");
  }

  const forEnv = Object.create(env);
  forEnv["__symbol__"] = new SymbolTable();

  // Variable
  args[0].evaluate(forEnv);

  // Condition
  while (args[1].evaluate(forEnv) === true) {
    // Body
    args[3].evaluate(forEnv);

    // Increment
    args[2].evaluate(forEnv);
  }

  return false;
};

SpecialForms["foreach"] = (args, env) => {
  if (args.length !== 3) {
    throw new SyntaxError("Bad number of args passed to foreach");
  }

  if (args[0].type !== "word") {
    throw new SyntaxError("The first argument to foreach must be a valid word");
  }

  const localEnv = Object.create(env);
  localEnv["__symbol__"] = new SymbolTable();

  const iterable = args[1].evaluate(localEnv);
  for (const val of iterable) {
    localEnv[args[0].name] = val;
    args[2].evaluate(localEnv);
  }

  return false;
};

SpecialForms["do"] = (args, env) => {
  let value = false;

  args.forEach(arg => {
    value = arg.evaluate(env);
  });

  return value;
};

SpecialForms["def"] = SpecialForms["define"] = SpecialForms[":="] = (args, env) => {
  if (args.length !== 2 || args[0].type !== "word") {
    throw new SyntaxError("Bad use of define");
  }

  // Value to assign to the variable
  let value = args[1].evaluate(env);

  // Variable name
  let valName = args[0].name;

  if (env["__symbol__"].checkAttribute("const", valName)) {
    throw new ReferenceError(`Trying to change 'const' variable ${args[0].name}`);
  }

  env[valName] = value;
  return value;
};

SpecialForms["fun"] = SpecialForms["->"] = (args, env) => {
  if (!args.length) {
    throw new SyntaxError("Functions need a body.");
  }

  function name(expr) {
    if (expr.type !== "word") {
      throw new SyntaxError("Arg names must be words");
    }

    return expr.name;
  }

  let argNames = args.slice(0, args.length - 1).map(name);
  let body = args[args.length - 1];

  return function() {
    if (arguments.length !== argNames.length) {
      throw new TypeError("Wrong number of arguments");
    }

    const localEnv = Object.create(env);
    localEnv["__symbol__"] = new SymbolTable();

    for (let i = 0; i < arguments.length; i++) {
      localEnv[argNames[i]] = arguments[i];
    }

    return body.evaluate(localEnv);
  };
};

SpecialForms["set"] = SpecialForms["="] = (args, env) => {
  if (args[0].type !== "word") {
    throw new SyntaxError("Bad use of set");
  }

  let valName = args[0].name;

  let indices = args.slice(1, -1).map(arg => arg.evaluate(env));

  let value = args[args.length - 1].evaluate(env);

  for (let scope = env; scope; scope = Object.getPrototypeOf(scope)) {
    if (scope["__symbol__"].checkAttribute("const", valName)) {
      throw new ReferenceError(`Trying to change 'const' variable ${args[0].name}`);
    }

    // TODO: Reduce code duplication
    if ("this" in scope) {
      // TODO: use hasOwnProperty ?

      if (Object.prototype.hasOwnProperty.call(scope["this"], valName)) {
        if (indices.length === 0) {
          scope["this"][valName] = value;
        } else {
          scope["this"][valName].setelem(value, ...indices);
        }

        return value;
      }
    }

    if (Object.prototype.hasOwnProperty.call(scope, valName)) {
      if (indices.length === 0) {
        scope[valName] = value;
      } else {
        scope[valName].setelem(value, ...indices);
      }

      return value;
    }
  }

  throw new ReferenceError(`Tried setting an undefined variable: ${valName}`);
};

SpecialForms["object"] = (args, env) => {
  // Create a new object and a new scope
  const object = {};
  const objectEnv = Object.create(env);
  objectEnv["__symbol__"] = new SymbolTable();

  // Add the variable 'this' as a reference to the current object
  objectEnv["this"] = object;

  // Evaluate the arguments and add the methods/properties to the object
  const evArgs = args.map(arg => arg.evaluate(objectEnv));

  for (const pair of utils.chunk(evArgs, 2)) {
    const name = pair[0];
    const value = pair[1];

    object[name] = value;
  }

  return object;
};

SpecialForms["const"] = (args, env) => {
  if (args[0].type !== "word") {
    throw new SyntaxError("Bad number of arguments");
  }

  const value = SpecialForms["define"](args, env);

  // Variable name
  const name = args[0].name;

  // Add const attribute to the symbol table
  env["__symbol__"].addAttribute("const", name);
  console.log(env["__symbol__"]);

  return value;
};

SpecialForms["try"] = (args, env) => {
  if (args.length < 2) {
    throw new SyntaxError("Bad use of try-catch block");
  }

  const body = args[0];
  const catch_body = args[1];

  try {
    body.evaluate(env);
  } catch (err) {
    env["__error__"] = err;
    catch_body.evaluate(env);
  } finally {
    if (args.length === 3) {
      const finally_body = args[2];

      finally_body.evaluate(env);
    }
  }

  return false;
};

// TODO: Continue implementing class?
//
// SpecialForms['class'] = (args, env) => {
//   // const evArgs = args.map((arg) => evaluate(arg, env));
//
//   const newClass = function(x, y) {
//     this.x = x;
//     this.y = y;
//   }
//
//   return newClass;
// }

["+", "-", "*", "/", "==", "!=", "<", ">", ">=", "<=", "&&", "||"].forEach(op => {
  TopEnv[op] = new Function("a, b", `return a ${op} b;`);
});

TopEnv["true"] = true;
TopEnv["false"] = false;
TopEnv["null"] = null;

TopEnv["print"] = value => {
  console.log(value);
  return value;
};

TopEnv["arr"] = TopEnv["array"] = (...args) => {
  return args;
};

TopEnv["map"] = TopEnv["dict"] = (...args) => {
  return new Map(utils.chunk(args, 2));
};

TopEnv["<-"] = TopEnv["[]"] = TopEnv["element"] = (object, ...indices) => {
  return object.sub(...indices);
};

TopEnv["length"] = array => {
  return array.length;
};

TopEnv["RegExp"] = (method, ...args) => {
  return xRegExp[method](...args);
};

TopEnv["child"] = parent => {
  return Object.create(parent);
};

TopEnv["throw"] = obj => {
  throw obj;
};

TopEnv["__symbol__"] = new SymbolTable();

// WIP: Continue implementing class?
// TopEnv['new'] = (...args) => {
//   const className = args[0];
//
//   // TODO: Check for more exceptions
//   if(typeof className !== "function") {
//     throw new SyntaxError(`${className} must be a class with a constructor.`)
//   }
//
//   return new className(...args.slice(1));
//

module.exports = {
  SpecialForms,
  TopEnv
};
