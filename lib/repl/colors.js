const {TopEnv} = require('../interp/environment.js');

const RED = TopEnv['__RED__'] = '\033[31m'
const GREEN = TopEnv['__GREEN__'] = '\033[32m'
const YELLOW = TopEnv['__YELLOW__'] = '\033[33m'
const BLUE = TopEnv['__BLUE__'] = '\033[34m'
const DEFAULT = TopEnv['__DEF__'] = '\033[39m'

module.exports = {
  RED, GREEN, YELLOW, BLUE, DEFAULT
}
