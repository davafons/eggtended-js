const process = require('process');

const {SpecialForms} = require('../registry.js');
const {TopEnv} = require('../environment.js');

const colors = require('./colors.js');


// PROMPT

TopEnv['__PROMPT__'] = '> ';

const getPromptLine = () => {
  return colors.YELLOW + TopEnv['__PROMPT__'] + colors.DEFAULT;
}


// Extra methods

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
  console.log(colors.BLUE + `
                   _                 _          _
                  | |               | |        | |
   ___  __ _  __ _| |_ ___ _ __   __| | ___  __| |
  / _ \\/ _\` |/ _\` | __/ _ \\ '_ \\ / _\` |/ _ \\/ _\` |
 |  __/ (_| | (_| | ||  __/ | | | (_| |  __/ (_| |
  \\___|\\__, |\\__, |\\__\\___|_| |_|\\__,_|\\___|\\__,_|
        __/ | __/ |
       |___/ |___/
` + colors.DEFAULT);
  console.log(`Version ${TopEnv['__VERSION__']}`);
  console.log('Created by David Afonso Dorta. License: GPLv2');
}

const eggClear = TopEnv['clear'] = () => {
  console.log('\u001B[2J\u001B[0;0f')
  eggInfo();
}

const eggVersion = TopEnv['__VERSION__'] = require('../../package.json').version;


const _allProperties = (obj) => {
  let keys = [];

  let proto = obj;
  while(proto) {
    keys = keys.concat(Object.keys(proto));
    proto = Object.getPrototypeOf(proto);
  }

  return keys;
}

const eggCompleter = (line, env) => {
  const word = line.split(/[\s(),"]+/).slice(-1)[0];
  line = line.slice(-word.length);

  let hits = Object.keys(SpecialForms).concat(_allProperties(env)).filter((key) => {
      return key.indexOf(word) === 0;
    });

  return [hits, line];
}

module.exports = {
  getPromptLine,
  eggExit,
  eggHelp,
  eggInfo,
  eggClear,
  eggVersion,
  eggCompleter,
}
