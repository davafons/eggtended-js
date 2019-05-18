#!/usr/bin/env node

const { repl } = require("../lib/repl/repl.js");
const { Eggvm } = require("../lib/interp/eggvm.js");
const process = require("process");

const inspect = require("util").inspect;
const ins = x => inspect(x, { depth: "null" });

const file = process.argv.slice(2).shift();
if (file && file.length > 0) {
  let returnValue = undefined;
  if (file.split(".").pop() === "evm") {
    returnValue = Eggvm.runFromEVM(file);
  } else {
    returnValue = Eggvm.runFromFile(file);
  }

  console.log("Return value: " + ins(returnValue));
} else {
  repl();
}
