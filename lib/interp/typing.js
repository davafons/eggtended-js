const { SpecialForms } = require("./registry");

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
