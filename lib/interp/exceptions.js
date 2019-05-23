const { SpecialForms, TopEnv } = require("./registry");

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

TopEnv["throw"] = obj => {
  throw obj;
};
