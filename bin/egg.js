#!/usr/bin/env node

const {Evaluator} = require('../lib/eggvm.js');
const process = require('process');

const file = process.argv.slice(2).shift();
if (file && file.length > 0) {
  let eggvm = new Evaluator();
  let output = eggvm.runFromFile(file);
  console.log(output);
}
