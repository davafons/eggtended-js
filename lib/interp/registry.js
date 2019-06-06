const xRegExp = require("xregexp");

const utils = require("../utils.js");

// specialForms and topEnv maps
const SpecialForms = Object.create(null);
const TopEnv = Object.create(null);

SpecialForms["if"] = {
  fun: (args, env) => {
    if (args[0].evaluate(env) === true) {
      return args[1].evaluate(env);
    } else {
      return args[2].evaluate(env);
    }
  },
  n_args: n => n === 3
};

SpecialForms["while"] = {
  fun: (args, env) => {
    while (args[0].evaluate(env) === true) {
      args[1].evaluate(env);
    }

    // Egg has no undefined so we return false when there's no meaningful result
    return false;
  },
  n_args: n => n === 2
};

SpecialForms["for"] = {
  fun: (args, env) => {
    const forEnv = Object.create(env);

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
  },
  n_args: n => n === 4
};

SpecialForms["foreach"] = {
  fun: (args, env) => {
    if (args[0].type !== "word") {
      throw new SyntaxError("The first argument to foreach must be a valid word");
    }

    const localEnv = Object.create(env);

    const iterable = args[1].evaluate(localEnv);
    for (const val of iterable) {
      localEnv[args[0].name] = val;
      args[2].evaluate(localEnv);
    }

    return false;
  },
  n_args: n => n === 3
};

SpecialForms["do"] = {
  fun: (args, env) => {
    let value = false;

    args.forEach(arg => {
      value = arg.evaluate(env);
    });

    return value;
  },
  n_args: n => n >= 0
};

SpecialForms["def"] = SpecialForms["define"] = SpecialForms[":="] = {
  fun: (args, env) => {
    // Value to assign to the variable
    let value = args[1].evaluate(env);

    // Variable name
    let valName = args[0].name;

    env[valName] = value;
    return value;
  },
  n_args: n => n === 2
};

SpecialForms["fun"] = SpecialForms["->"] = {
  fun: (args, env) => {
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
        throw new SyntaxError(
          `Wrong number of arguments. Got: ${arguments.length}. Expected: ${
            argNames.length
          }`
        );
      }

      const localEnv = Object.create(env);

      for (let i = 0; i < arguments.length; i++) {
        localEnv[argNames[i]] = arguments[i];
      }

      return body.evaluate(localEnv);
    };
  },
  n_args: n => n >= 1
};

SpecialForms["set"] = SpecialForms["="] = {
  fun: (args, env) => {
    if (args[0].type !== "word") {
      throw new SyntaxError("Bad use of set");
    }

    let valName = args[0].name;

    let indices = args.slice(1, -1).map(arg => arg.evaluate(env));

    let value = args[args.length - 1].evaluate(env);

    for (let scope = env; scope; scope = Object.getPrototypeOf(scope)) {
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
  },
  n_args: n => n >= 2
};

SpecialForms["object"] = {
  fun: (args, env) => {
    // Create a new object and a new scope
    const object = {};
    const objectEnv = Object.create(env);

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
  },
  n_args: n => n % 2 === 0
};

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
  TopEnv[op] = { fun: new Function("a, b", `return a ${op} b;`), n_args: n => n == 2 };
});

TopEnv["true"] = true;
TopEnv["false"] = false;
TopEnv["null"] = null;

TopEnv["print"] = {
  fun: (...value) => {
    console.log(...value);
    return value;
  },
  n_args: n => n >= 1
};

TopEnv["arr"] = TopEnv["array"] = {
  fun: (...args) => {
    return args;
  },
  n_args: n => n >= 0
};

TopEnv["map"] = TopEnv["dict"] = {
  fun: (...args) => {
    return new Map(utils.chunk(args, 2));
  },
  n_args: n => n % 2 == 0
};

TopEnv["<-"] = TopEnv["[]"] = TopEnv["element"] = {
  fun: (object, ...indices) => {
    return object.sub(...indices);
  },
  n_args: n => n >= 2
};

TopEnv["length"] = {
  fun: array => {
    return array.length;
  },
  n_args: n => n === 1
};

TopEnv["RegExp"] = {
  fun: (method, ...args) => {
    return xRegExp[method](...args);
  },
  n_args: n => n >= 1
};

TopEnv["child"] = {
  fun: parent => {
    return Object.create(parent);
  },
  n_args: n => n === 1
};

module.exports = {
  SpecialForms,
  TopEnv,
  ARITHM_OPERATORS
};
