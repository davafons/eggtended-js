const { SpecialForms, TopEnv } = require("./registry");

const utils = require("../utils.js");

SpecialForms["try"] = {
  fun: (args, env) => {
    // Code to evaluate
    const body = args[0];

    // Catch code
    const catch_body = args[1];

    try {
      body.evaluate(env);
    } catch (err) {
      // Store the error object on a special variable, accesible from the catch scope
      env["__error__"] = err;
      catch_body.evaluate(env);
    } finally {
      // Optional finally block
      if (args.length === 3) {
        const finally_body = args[2];

        finally_body.evaluate(env);
      }
    }

    return false;
  },
  n_args: n => 2 <= n <= 3,
  args_expect_mid: [utils.isApply]
};

TopEnv["throw"] = {
  fun: obj => {
    throw obj;
  },
  n_args: n => n === 1,
  args_expect: [utils.isAny]
};

[SyntaxError, TypeError, ReferenceError, RangeError].forEach(ExceptionClass => {
  TopEnv[ExceptionClass.name] = {
    fun: message => {
      return new ExceptionClass(message);
    },
    n_args: n => n === 1
  };
});
