#!/usr/bin/env node

const {Parser} = require('../lib/parse.js');
const fs = require('fs');
const process = require('process');

const file = process.argv.slice(2).shift();
if (file && file.length > 0) {
  let parser = new Parser();
  let tree = parser.parseFromFile(file);

  const json = JSON.stringify(tree, null, '  ');
  fs.writeFileSync(file + '.evm', json);
  console.log(json);
}
