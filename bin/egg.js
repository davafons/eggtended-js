#!/usr/bin/env node

const fs = require("fs");
const commander = require("commander");
const process = require("process");
const { Eggvm } = require("../lib/interp/eggvm.js");
const { Parser } = require("../lib/parser/parse.js");
const { Lexer } = require("../lib/parser/lexer.js");
const { Semantic } = require("../lib/parser/semantic.js");
const { Optimizer } = require("../lib/parser/optimizer.js");
const { repl } = require("../lib/repl/repl.js");

commander
  .version(`eggtended-js ${require("../package.json").version}`)
  .option(
    "-r --run <fileName.egg>",
    "compiles the input egg program and runs it using the egg interpreter"
  )
  .option(
    "-c --compile <fileName.egg>",
    "compile the input egg program to produce a JSON containing the resulting egg AST"
  )
  .option(
    "-t --tokenize <fileName.egg>",
    "tokenize the input egg program and print the array of tokens produced"
  )
  .option("-o --optimize", "optimize the resulting AST, generating a smaller one")
  .option("-i --interpret <fileName>", "interprets the input egg AST")
  .parse(process.argv);

// Interpreter args
const args = {
  optimize: false
};

if (commander.optimize) {
  args.optimize = true;
}

if (commander.run) {
  const output = Eggvm.runFromFile(commander.run, args);

  console.log(`Return value: ${output}`);
} else if (commander.compile) {
  let tree = Parser.parseFromFile(commander.compile);
  tree = Semantic.check(tree);

  if (commander.optimize) {
    console.log("Optimizer called");
    tree = Optimizer.optimize(tree);
  }

  const json = JSON.stringify(tree, null, "  ");
  fs.writeFileSync(commander.compile + ".evm", json);

  console.log(json);
} else if (commander.tokenize) {
  const tokens = Lexer.tokenizeFromFile(commander.tokenize);

  console.log(tokens);
} else if (commander.interpret) {
  const output = Eggvm.runFromEVM(commander.interpret, args);

  console.log(`Return value: ${output}`);
} else {
  repl();
}
