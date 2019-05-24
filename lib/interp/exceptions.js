const { SpecialForms, TopEnv } = require("./registry");

SpecialForms["try"] = (args, env) => {
  if (args.length < 2 || args.length > 3) {
    throw new SyntaxError("Bad use of try-catch block");
  }

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
};

TopEnv["throw"] = (obj) => {
  throw obj;
};

[SyntaxError, TypeError, ReferenceError, RangeError].forEach((ExceptionClass) => {
  TopEnv[ExceptionClass.name] = (message) => {
    return new ExceptionClass(message);
  }
})
