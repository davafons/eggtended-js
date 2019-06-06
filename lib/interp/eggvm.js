// Add monkey-patching functions and extended functions
require("./monkey-patching.js");
require("./require.js");
require("./arithm.js");
require("./exceptions.js");

const fs = require("fs");

const { Parser } = require("../parser/parse.js");
const { Semantic } = require("../parser/semantic.js");
const { TopEnv } = require("./environment.js");
const { json2AST } = require("../parser/json2AST.js");

class Eggvm {
  run(program) {
    const tree = Parser.parse(program);

    return this.eval(tree);
  }

  static run(program) {
    return new Eggvm().run(program);
  }

  runFromFile(file) {
    const program = fs.readFileSync(file, "utf8");

    return this.run(program);
  }

  static runFromFile(file) {
    return new Eggvm().runFromFile(file);
  }

  runFromEVM(file) {
    const rawData = fs.readFileSync(file);
    let json = JSON.parse(rawData);

    const tree = json2AST(json);

    return this.eval(tree);
  }

  static runFromEVM(file) {
    return new Eggvm().runFromEVM(file);
  }

  eval(tree, env) {
    // Create a new env if not already defined on parameters
    if (env === undefined || env === null) {
      env = Object.create(TopEnv);
    }

    // Check that the tree doesn't have errors before evaluation
    Semantic.check(tree);

    return tree !== null ? tree.evaluate(env) : null;
  }

  static eval(tree, env) {
    return new Eggvm().eval(tree, env);
  }

  getEnvFromFile(file) {
    const env = Object.create(TopEnv);
    const tree = Parser.parseFromFile(file);
    this.eval(tree, env);

    return env;
  }

  static getEnvFromFile(file) {
    return new Eggvm().getEnvFromFile(file);
  }
}

module.exports = {
  Eggvm
};
