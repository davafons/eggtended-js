const {TopEnv} = require('../interp/environment.js');
const style = require('ansi-styles');

const RED = TopEnv['__RED__'] = style.red.open;
const GREEN = TopEnv['__GREEN__'] = style.green.open;
const YELLOW = TopEnv['__YELLOW__'] = style.yellow.open;
const BLUE = TopEnv['__BLUE__'] = style.blue.open;
const DEFAULT = TopEnv['__DEF__'] = style.color.close;

console.log(RED);

module.exports = {
  RED, GREEN, YELLOW, BLUE, DEFAULT
}
