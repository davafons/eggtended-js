const { SpecialForms, TopEnv } = require("./registry");

SpecialForms["const"] = (args, env) => {
  if (args[0].type !== "word") {
    throw new SyntaxError("Bad number of arguments");
  }

  const value = SpecialForms["define"](args, env);

  // Variable name
  const name = args[0].name;

  // Add const attribute to the symbol table
  env["__symbol__"].addAttribute("const", true, name);

  return value;
};

SpecialForms["define_wrapped"] = SpecialForms["define"];
SpecialForms["def"] = SpecialForms["define"] = SpecialForms[":="] = (args, env) => {
  if (args.length !== 2 || args[0].type !== "word") {
    throw new SyntaxError("Bad use of define");
  }

  // Variable name
  let valName = args[0].name;

  if (env["__symbol__"].checkAttribute("const", valName)) {
    throw new ReferenceError(`Trying to change 'const' variable ${args[0].name}`);
  }

  return SpecialForms["define_wrapped"](args, env);
};

[Number, String, Boolean].forEach(type => {
  TopEnv[String(type.name).toLowerCase()] = x => {
    return type(x);
  };
});
