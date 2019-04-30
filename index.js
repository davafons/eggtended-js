const {Lexer, Parser, TokenRegex, json2AST} = require('./lib/parser')
const {Eggvm, Value, Word, Apply, Regex} = require('./lib/interp');

module.exports = {
  Lexer, Parser, TokenRegex, json2AST, Eggvm, Value, Word, Apply, Regex
}
