const process = require('process');
const readline = require('readline');

const {Lexer} = require('../lexer.js');
const {Parser} = require('../parse.js');
const {TopEnv} = require('../environment.js');
const {Eggvm} = require('../eggvm.js');
const colors = require('./colors.js');

const extensions = require('./extensions.js');

const repl = () => {
  // Create the REPL environment
  const topEnv = Object.create(TopEnv);
  const lexer = new Lexer();
  const parser = new Parser();
  const eggvm = new Eggvm();


  let program = '';
  let stack = 0;

  extensions.eggInfo();

  try {
    const rl = readline.createInterface(process.stdin, process.stdout, (line) =>
    { return extensions.eggCompleter(line, topEnv)});

    rl.setPrompt(extensions.getPromptLine());
    rl.prompt();

    rl.on('line', (line) => {
      program += line + '\n';

      // Count the number of LPS (+) or RPS (-)
      stack = lexer.getParBalance(program);

      if(stack <= 0) {
        try {
          eggvm.eval(parser.parse(program), topEnv);

        } catch(err) {
          console.log(colors.RED + 'Error:: ' + err + colors.DEFAULT);

        } finally {
          program = '';
          stack = 0;
        }
      }

      rl.setPrompt(extensions.getPromptLine() + '..'.repeat(stack));
      rl.prompt();
    });

    rl.on('close', extensions.eggExit);

    rl.on('SIGINT', () => {
      console.log(colors.GREEN + "\n--> Expression discarded" + colors.DEFAULT);

      program = '';
      stack = 0;

      rl.clearLine(process.stdout);

      rl.setPrompt(extensions.getPromptLine());
      rl.prompt();
    });

  } catch(err) {
    console.log(err);
    extensions.eggHelp();
  }
}

// Completer

module.exports = {
  repl
}
