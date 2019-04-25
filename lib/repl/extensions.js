const process = require('process');
const fs = require('fs');

const {SpecialForms} = require('../interp/registry.js');
const {TopEnv} = require('../interp/environment.js');
const {Eggvm} = require('../interp/eggvm.js');

const colors = require('./colors.js');


// PROMPT

TopEnv['__PROMPT__'] = '> ';

const getPromptLine = () => {
  return colors.YELLOW + TopEnv['__PROMPT__'] + colors.DEFAULT;
};


// Extra methods

const eggExit = TopEnv['exit'] = () => {
  console.log(colors.BLUE + 'Closing the REPL... Bye!' + colors.DEFAULT);
  process.exit(0);
};

const HELP = [
  (colors.BLUE + 'help()' + colors.DEFAULT + ' show this help menu'),
  (colors.RED + 'exit() | Ctrl-D' + colors.DEFAULT + ' close the REPL'),
  (colors.GREEN + 'run()' + colors.DEFAULT + ' execute a .egg file'),
  (colors.YELLOW + 'clear()' + colors.DEFAULT + ' clear the console')
];

const eggHelp = TopEnv['help'] = () => {
  console.log(' Egg help menu:');
  HELP.forEach((line) => {
    console.log(line);
  });

  return '-'.repeat(HELP[0].length - 10);
};

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
};

const eggClear = TopEnv['clear'] = () => {
  console.log('\u001B[2J\u001B[0;0f');
  eggInfo();
};

const eggVersion = TopEnv['__VERSION__'] = require('../../package.json').version;

const eggRun = TopEnv['run'] = (file, debug) => {
  if(debug) {
    console.log(fs.readFileSync(file, 'utf8'));
  }

  Eggvm.runFromFile(file);
};

const eggCompleter = (line, env) => {

  // Test if get hits from current directory
  let hits = dirHits(line);

  // Show hits from the REPL variables
  if(hits.length === 0) {
    const word = line.split(/[\s(),"]+/).slice(-1)[0];
    hits = _filter(Object.keys(SpecialForms).concat(_allProperties(env)), word);
  }

  return [hits, line];
};

const _allProperties = (obj) => {
  let keys = [];

  let proto = obj;
  while(proto) {
    keys = keys.concat(Object.keys(proto));
    proto = Object.getPrototypeOf(proto);
  }

  return keys;
};

const dirHits = (line) => {
  const match = line.match(/(?:run)\((.*)/);
  if(match) {
    const path = match[1].replace(/["'`]/, '').trim().split('/');
    const dirPath = path.slice(0, -1);
    const filePath = path.slice(-1);

    try {
      return _filter(fs.readdirSync(`./${dirPath}`), filePath);
    } catch(err) {
      return [];
    }
  }

  return [];
};

const _filter = (hits, word) => {
  return hits.filter((hit) => {
    return hit.indexOf(word) === 0;
  });

};

module.exports = {
  getPromptLine,
  eggExit,
  eggHelp,
  eggInfo,
  eggClear,
  eggVersion,
  eggRun,
  eggCompleter
};
