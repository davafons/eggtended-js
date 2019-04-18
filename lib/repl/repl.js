const process = require('process');
const readline = require('readline');

const {Parser} = require('../parse.js');
const {TopEnv} = require('../environment.js');
const {evaluate, SpecialForms} = require('../registry.js');

const extensions = require('./extensions.js');

// TODO: User defined prompt
// TODO: Make the repl modificable from inside

const run = () => {
  // Create the REPL environment
  const topEnv = Object.create(TopEnv);
  const parser = new Parser();

  let program = '';
  let stack = 0;

  extensions.eggInfo();

  try {
    const rl = readline.createInterface(process.stdin, process.stdout);
    rl.prompt();

    rl.on('line', (line) => {
      // Count the number of LPS (+) or RPS (-)
      /* stack += parser.parBalance(line); */

      program += line + '\n';

      if(stack <= 0) {
        try {
          evaluate(parser.parse(program), topEnv);

        } catch(err) {
          console.log("Error:: " + err);

        } finally {
          program = '';
        }
      }

      rl.prompt();
    });

    rl.on('close', extensions.eggExit);

    // TODO: Implement
    rl.on('SIGINT', () => { console.log('CC captured') });

  } catch(err) {
    console.log(err);
    extensions.eggHelp();
  }

}

run();
