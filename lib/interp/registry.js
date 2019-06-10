const xRegExp = require("xregexp");

const utils = require("../utils.js");

// specialForms and topEnv maps
const SpecialForms = Object.create(null);
const TopEnv = Object.create(null);

SpecialForms["if"] = {
  fun: (args, env) => {
    const ifEnv = Object.create(env);

    if (args[0].evaluate(env)) {
      return args[1].evaluate(ifEnv);
    } else {
      return args[2].evaluate(ifEnv);
    }
  },
  n_args: n => n === 3,
  args_expect: [utils.isAny, utils.isApply, utils.isApply]
};

SpecialForms["while"] = {
  fun: (args, env) => {
    const whileEnv = Object.create(env);

    while (args[0].evaluate(whileEnv)) {
      args[1].evaluate(whileEnv);
    }

    // Egg has no undefined so we return false when there's no meaningful result
    return false;
  },
  n_args: n => n === 2,
  args_expect: [utils.isAny, utils.isApply]
};

SpecialForms["for"] = {
  fun: (args, env) => {
    const forEnv = Object.create(env);

    // Variable
    args[0].evaluate(forEnv);

    // Condition
    while (args[1].evaluate(forEnv)) {
      // Body
      args[3].evaluate(forEnv);

      // Increment
      args[2].evaluate(forEnv);
    }

    return false;
  },
  n_args: n => n === 4,
  // Maybe the for loop should be more strict with the expectations?
  args_expect: [utils.isAny, utils.isAny, utils.isApply, utils.isAny]
};

SpecialForms["foreach"] = {
  fun: (args, env) => {
    const localEnv = Object.create(env);

    const iterable = args[1].evaluate(localEnv);
    for (const val of iterable) {
      localEnv[args[0].name] = val;
      args[2].evaluate(localEnv);
    }

    return false;
  },
  n_args: n => n === 3,
  args_expect: [utils.isWord, utils.isAny, utils.isApply]
};

SpecialForms["do"] = {
  fun: (args, env) => {
    const doEnv = Object.create(env);

    let value = false;

    args.forEach(arg => {
      value = arg.evaluate(doEnv);
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
  n_args: n => n === 2,
  args_expect: [utils.isUnion(utils.isWord, utils.isApply), utils.isAny]
};

SpecialForms["fun"] = SpecialForms["->"] = {
  fun: (args, env) => {
    let argNames = args.slice(0, args.length - 1).map(node => node.name);
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
  n_args: n => n >= 1,
  args_expect_mid: [utils.isWord],
  args_expect_lasts: [utils.isAny]
};

SpecialForms["set"] = SpecialForms["="] = {
  fun: (args, env) => {
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
  n_args: n => n >= 2,
  args_expect_firsts: [utils.isWord],
  args_expect_mid: [utils.isAny],
  args_expect_lasts: [utils.isAny]
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
  n_args: n => n % 2 === 0,
  args_expect_mid: [utils.isValue, utils.isAny]
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

["const"].forEach(key => {
  TopEnv[key] = {
    fun: word => {
      return word;
    },
    n_args: n => n === 1
  };
});

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
  n_args: n => n % 2 == 0,
  args_expect_mid: [utils.isValue, utils.isAny]
};

TopEnv["<-"] = TopEnv["[]"] = TopEnv["element"] = {
  fun: (object, ...indices) => {
    return object.sub(...indices);
  },
  n_args: n => n >= 2,
  args_expect_firsts: [utils.isUnion(utils.isWord, utils.isApply)],
  args_expect_mid: [utils.isAny]
};

TopEnv["length"] = {
  fun: array => {
    return array.length;
  },
  n_args: n => n === 1,
  args_expect: [utils.isUnion(utils.isWord, utils.isApply)]
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
  n_args: n => n === 1,
  args_expect: [utils.isUnion(utils.isWord, utils.isApply)]
};

module.exports = {
  SpecialForms,
  TopEnv,
  ARITHM_OPERATORS
};
