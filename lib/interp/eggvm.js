// Add monkey-patching functions and extended functions
require("./monkey-patching.js");
require("./require.js");
require("./arithm.js");
require("./exceptions.js");

const fs = require("fs");

const { Parser } = require("../parser/parse.js");
const { Optimizer } = require("../parser/optimizer.js");
const { Semantic } = require("../parser/semantic.js");
const { TopEnv } = require("./environment.js");
const { json2AST } = require("../parser/json2AST.js");

class Eggvm {
  run(program, args) {
    const tree = Parser.parse(program);

    return this.eval(tree, args);
  }

  static run(program, args) {
    return new Eggvm().run(program, args);
  }

  runFromFile(file, args) {
    const program = fs.readFileSync(file, "utf8");

    return this.run(program, args);
  }

  static runFromFile(file, args) {
    return new Eggvm().runFromFile(file, args);
  }

  runFromEVM(file, args) {
    const rawData = fs.readFileSync(file);
    let json = JSON.parse(rawData);

    const tree = json2AST(json);

    return this.eval(tree, args);
  }

  static runFromEVM(file, args) {
    return new Eggvm().runFromEVM(file, args);
  }

  eval(tree, env, args) {
    // Create a new env if not already defined on parameters
    if (env === undefined || env === null) {
      env = Object.create(TopEnv);
    }

    if (args === undefined) {
      args = { optimize: true };
    }

    // Optimize the tree if specified
    if (args.optimize) {
      tree = Optimizer.optimize(tree);
    }

    // Check that the tree doesn't have errors before evaluation
    Semantic.check(tree);

    return tree !== null ? tree.evaluate(env) : null;
  }

  static eval(tree, env, args) {
    return new Eggvm().eval(tree, env, args);
  }

  getEnvFromFile(file, args) {
    const env = Object.create(TopEnv);
    const tree = Parser.parseFromFile(file);
    this.eval(tree, env, args);

    return env;
  }

  static getEnvFromFile(file, args) {
    return new Eggvm().getEnvFromFile(file, args);
  }
}

module.exports = {
  Eggvm
};
