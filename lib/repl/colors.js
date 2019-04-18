const {TopEnv} = require('../environment.js');

const RED = TopEnv['__RED__'] = '\033[31m'
const BLUE = TopEnv['__BLUE__'] = '\033[34m'
const DEFAULT = TopEnv['__DEF__'] = '\033[39m'

module.exports = {
  RED, BLUE, DEFAULT
}
