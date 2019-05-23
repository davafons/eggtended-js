// Add monkey-patching functions and extended functions
require("./monkey-patching.js");
require("./require.js");
require("./arithm.js");
require("./exceptions.js");
require("./typing.js");

const fs = require("fs");

const { Parser } = require("../parser/parse.js");
const { TopEnv } = require("./environment.js");
const { json2AST } = require("../parser/json2AST.js");

class Eggvm {
  static run(program) {
    const tree = Parser.parse(program);

    return Eggvm.eval(tree);
  }

  static runFromFile(file) {
    const program = fs.readFileSync(file, "utf8");

    return Eggvm.run(program);
  }

  static runFromEVM(file) {
    const rawData = fs.readFileSync(file);
    let json = JSON.parse(rawData);

    const tree = json2AST(json);

    return Eggvm.eval(tree);
  }

  static eval(tree, env) {
    // Create a new env if not already defined on parameters
    if (env === undefined || env === null) {
      env = Object.create(TopEnv);
    }

    return tree !== null ? tree.evaluate(env) : null;
  }

  static getEnvFromFile(file) {
    const env = Object.create(TopEnv);
    const tree = Parser.parseFromFile(file);
    Eggvm.eval(tree, env);

    return env;
  }
}

module.exports = {
  Eggvm
};
