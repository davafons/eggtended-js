const process = require('process');

const {TopEnv} = require('../environment.js');

const colors = require('./colors.js');


const eggExit = TopEnv['exit'] = () => {
  console.log(colors.BLUE + 'Closing the REPL... Bye!' + colors.DEFAULT);
  process.exit(0);
}

const HELP = [
  (colors.BLUE + 'help()' + colors.DEFAULT + ' show this help menu'),
  (colors.RED + 'exit() | Ctrl-D' + colors.DEFAULT + ' close the REPL')
];

const eggHelp = TopEnv['help'] = () => {
  console.log(' Egg help menu:');
  HELP.forEach((line) => {
    console.log(line);
  })

  return "-".repeat(HELP[0].length-10);
}

const eggInfo = TopEnv['info'] = () => {
  console.log(`__Egg REPL__\nVersion ${TopEnv['__version__']}`);
  console.log('Created by David Afonso Dorta. License: GPLv2');
}

const eggVersion = TopEnv['__version__'] = require('../../package.json').version;

module.exports = {
  eggExit,
  eggHelp,
  eggInfo,
  eggVersion
}
