#!/usr/bin/env node

const fs = require("fs");
const commander = require("commander");
const process = require("process");
const { Eggvm } = require("../lib/interp/eggvm.js");
const { Parser } = require("../lib/parser/parse.js");
const { Lexer } = require("../lib/parser/lexer.js");
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
  .option("-i --interpret <fileName>", "interprets the input egg AST")
  .parse(process.argv);

if (commander.run) {
  const output = Eggvm.runFromFile(commander.run);

  console.log(`Return value: ${output}`);
} else if (commander.compile) {
  const tree = Parser.parseFromFile(commander.compile);

  const json = JSON.stringify(tree, null, "  ");
  fs.writeFileSync(commander.compile + ".evm", json);

  console.log(json);
} else if (commander.tokenize) {
  const tokens = Lexer.tokenizeFromFile(commander.tokenize);

  console.log(tokens);
} else if (commander.interpret) {
  const output = Eggvm.runFromEVM(commander.interpret);

  console.log(`Return value: ${output}`);
} else {
  repl();
}
