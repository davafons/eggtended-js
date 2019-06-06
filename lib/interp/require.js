const { TopEnv } = require("./environment.js");
const { Parser } = require("../parser/parse.js");

TopEnv["require"] = {
  fun: file => {
    if (!(file in TopEnv["require"].cache)) {
      const tree = Parser.parseFromFile(file);
      const env = Object.create(TopEnv);

      tree.evaluate(env);

      const module = { exports: env["module"].exports };

      TopEnv["require"].cache[file] = module;
    }

    return TopEnv["require"].cache[file].exports;
  },
  n_args: n => n === 1
};

TopEnv["require"].cache = Object.create(null);
TopEnv["module"] = {
  exports: {}
};

TopEnv["__addTopEnvProperties__"] = {
  fun: ModuleTopEnv => {
    for (const property in ModuleTopEnv) {
      TopEnv[property] = ModuleTopEnv[property];
    }
  },
  n_args: n => n === 1
};

// This function can import a npm module. The module will be saved on "var_name"
TopEnv["use"] = {
  fun: module_name => {
    const ModuleTopEnv = require(module_name).TopEnv;

    return ModuleTopEnv;
  },
  n_args: n => n === 1
};
