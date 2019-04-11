const XRegExp = require("xregexp");

class TokenRegex {
  constructor(name, expression) {
    TokenRegex.lastIndex = 0;
    TokenRegex.line = 1;

    this.name = name;
    this.expression = expression;
  }

  exec(program) {
    this.expression.lastIndex = TokenRegex.lastIndex;
    let match = this.expression.exec(program)

    if(match !== null) {
      TokenRegex.lastIndex = this.expression.lastIndex;

      return { type: this.name,
        value: match[1],
        start: TokenRegex.lastIndex - match[1].length + 1,
        end: TokenRegex.lastIndex,
        line: TokenRegex.line
      };
    }

    return null;
  }
}

let WHITES = new TokenRegex("WHITE", XRegExp(`(\\s+)`, `yx`));
let NEWLINE = new TokenRegex("NEWLINE", XRegExp(`(\\r?\\n)`));

let NUMBER = new TokenRegex("NUMBER", XRegExp(`([-+]?      # Sign
                                                 \\d*       # Digits
                                                 \\.?\\d+   # Decimals
                                                 (?:[eE][-+]?\\d+)?) # Exp not`,
                                                 'yx'));

let STRING = new TokenRegex("STRING", XRegExp(`"([^"\\\\]*)"`, 'yx'));
let WORD = new TokenRegex("WORD", XRegExp(`([^\\s(){},"]+)`, 'yx'))

let LP = XRegExp(`(\\()`, 'yx');
let RP = XRegExp(`(\\))`, 'yx');

let TOKENS = [NUMBER, STRING, WORD, LP, RP];

function getNextToken(program) {
  let whitespaces = WHITES.exec(program);
  if(whitespaces !== null) {
    if(NEWLINE.exec(whitespaces.value)) {
      ++TokenRegex.line;
    }

    return getNextToken(program);
  }

  for(let i = 0; i < TOKENS.length; ++i) {
    let token = TOKENS[i].exec(program);

    if(token !== null) {
      return token;
    }
  }

  return null;
}

module.exports = { getNextToken }
