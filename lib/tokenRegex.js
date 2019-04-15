const XRegExp = require("xregexp");

class TokenRegex {
  constructor(name, expression) {
    this.line = 1;

    this.name = name;
    this.expression = expression;
  }

  get lastIndex() {
    return this.expression.lastIndex;
  }

  set lastIndex(index) {
    this.expression.lastIndex = index;
  }

  reset() {
    this.lastIndex = 0;

    return this;
  }

  exec(program) {
    let match = this.expression.exec(program)

    if(match !== null) {
      return {
        type: this.name,
        value: match[1],
        start: this.lastIndex - match[1].length + 1,
        end: this.lastIndex,
        line: this.line
      };
    }

    return null;
  }
}

const WHITES = new TokenRegex("WHITE", XRegExp(`(\\s+)`, `yx`));
const NEWLINE = new TokenRegex("NEWLINE", XRegExp(`(\\r?\\n)`));
const NUMBER = new TokenRegex("NUMBER", XRegExp(`([-+]?      # Sign
                                                 \\d*       # Digits
                                                 \\.?\\d+   # Decimals
                                                 (?:[eE][-+]?\\d+)?) # Exp not`,
                                                 'yx'));

const STRING = new TokenRegex("STRING", XRegExp(`"([^"\\\\]*)"`, 'yx'));
const WORD = new TokenRegex("WORD", XRegExp(`([^\\s(){}\\[\\],"]+)`, 'yx'))

const LP = new TokenRegex("LP", XRegExp(`([({[])`, 'yx'));
const RP = new TokenRegex("RP", XRegExp(`([)}]])`, 'yx'));


module.exports = {
  WHITES,
  NEWLINE,
  NUMBER,
  STRING,
  WORD,
  LP,
  RP
}
