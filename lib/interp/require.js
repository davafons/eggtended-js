const { TopEnv } = require("./environment.js");
const { Parser } = require("../parser/parse.js");
const { SymbolTable } = require("./symboltable.js");

TopEnv["require"] = file => {
  if (!(file in TopEnv["require"].cache)) {
    const tree = Parser.parseFromFile(file);
    const env = Object.create(TopEnv);
    env["__symbol__"] = new SymbolTable();

    tree.evaluate(env);

    const module = { exports: env["module"].exports };

    TopEnv["require"].cache[file] = module;
  }

  return TopEnv["require"].cache[file].exports;
};

TopEnv["require"].cache = Object.create(null);
TopEnv["module"] = { exports: {} };

TopEnv["__addTopEnvProperties__"] = (ModuleTopEnv) => {
  Object.keys(ModuleTopEnv).forEach(property => {
    TopEnv[property] = ModuleTopEnv[property];
  });
}

TopEnv["use"] = module_name => {
  const ModuleTopEnv = require(module_name).TopEnv;

  TopEnv["__addTopEnvProperties__"](ModuleTopEnv);
};
