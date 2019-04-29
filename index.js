const {Lexer, Parser, TokenRegex, json2AST} = require('./lib/parser')
const {Eggvm} = require('./lib/interp');

module.exports = {
  Lexer, Parser, TokenRegex, json2AST, Eggvm
}
