const xRegExp = require("xregexp");

const utils = require("../utils.js");

const { SymbolTable } = require("./symboltable.js");

// specialForms and topEnv maps
const SpecialForms = Object.create(null);
const TopEnv = Object.create(null);

SpecialForms["if"] = (args, env) => {
  if (args[0].evaluate(env) === true) {
    return args[1].evaluate(env);
  } else {
    return args[2].evaluate(env);
  }
};
SpecialForms["if"].n_args = n_args => n_args === 3;

SpecialForms["while"] = (args, env) => {
  while (args[0].evaluate(env) === true) {
    args[1].evaluate(env);
  }

  // Egg has no undefined so we return false when there's no meaningful result
  return false;
};
SpecialForms["while"].n_args = n_args => n_args === 2;

SpecialForms["for"] = (args, env) => {
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
SpecialForms["for"].n_args = n_args => n_args === 4;

SpecialForms["foreach"] = (args, env) => {
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
SpecialForms["foreach"].n_args = n_args => n_args === 3;

SpecialForms["do"] = (args, env) => {
  let value = false;

  args.forEach(arg => {
    value = arg.evaluate(env);
  });

  return value;
};
SpecialForms["do"].n_args = n_args => n_args >= 0;

SpecialForms["def"] = SpecialForms["define"] = SpecialForms[":="] = (args, env) => {
  // Value to assign to the variable
  let value = args[1].evaluate(env);

  // Variable name
  let valName = args[0].name;

  env[valName] = value;
  return value;
};
SpecialForms["def"].n_args = SpecialForms["define"].n_args = SpecialForms[
  ":="
].n_args = n_args => n_args === 2;

SpecialForms["fun"] = SpecialForms["->"] = (args, env) => {
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
SpecialForms["fun"].n_args = SpecialForms["->"].n_args = n_args => n_args >= 1;

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
SpecialForms["set"].n_args = SpecialForms["="].n_args = n_args => n_args >= 2;

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
SpecialForms["object"].n_args = n_args => n_args % 2 === 0;

const ARITHM_OPERATORS = [
  "+",
  "-",
  "*",
  "/",
  "==",
  "!=",
  "<",
  ">",
  ">=",
  "<=",
  "&&",
  "||",
  "&",
  "|",
  "<<",
  ">>",
  ">>>"
];

ARITHM_OPERATORS.forEach(op => {
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

TopEnv["__symbol__"] = new SymbolTable();

module.exports = {
  SpecialForms,
  TopEnv,
  ARITHM_OPERATORS
};
