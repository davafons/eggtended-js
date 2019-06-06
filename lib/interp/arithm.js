const { SpecialForms } = require("./environment.js");

const { Value } = require("./ast.js");

SpecialForms["++"] = {
  fun: (args, env) => {
    return incrementHelper(args[0], env, 1);
  },
  n_args: n => n === 1
};

SpecialForms["--"] = {
  fun: (args, env) => {
    return incrementHelper(args[0], env, -1);
  },
  n_args: n => n === 1
};

SpecialForms["+="] = {
  fun: (args, env) => {
    const inc = args[1].evaluate(env);

    return incrementHelper(args[0], env, inc);
  },
  n_args: n => n === 2
};

SpecialForms["-="] = {
  fun: (args, env) => {
    const inc = args[1].evaluate(env);

    return incrementHelper(args[0], env, -inc);
  },
  n_args: n => n === 2
};

const incrementHelper = (variable, env, inc) => {
  const varValue = variable.evaluate(env);

  const token = { type: "value", value: varValue + inc };
  const newValue = new Value(token);

  return SpecialForms["set"].fun([variable, newValue], env);
};
