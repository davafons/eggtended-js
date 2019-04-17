#!/usr/bin/env node

const {Eggvm} = require('../lib/eggvm.js');
const process = require('process');

const inspect = require('util').inspect;
const ins = (x) => inspect(x, {depth: 'null'});

const file = process.argv.slice(2).shift();
if (file && file.length > 0) {
  let eggvm = new Eggvm();
  let returnValue = eggvm.runFromFile(file);

  console.log('Return value: ' + ins(returnValue));
}
