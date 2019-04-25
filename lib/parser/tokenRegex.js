const xRegExp = require('xregexp');

class TokenRegex {
  constructor(name, expression) {
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
    let match = this.expression.exec(program);

    if(match !== null) {
      return {
        type: this.name,
        value: match[1],
        start: this.lastIndex - match[1].length + 1,
        end: this.lastIndex
      };
    }

    return null;
  }

  test(program) {
    let savedIndex = this.lastIndex;
    const result = this.exec(program);
    this.lastIndex = savedIndex;

    return result !== null;
  }
}

const WHITES = new TokenRegex('WHITE', xRegExp(`(\\s+|[#;].*|\\/\\*[^]*?\\*\\/)`, `yx`));
const NEWLINE = new TokenRegex('NEWLINE', xRegExp(`(\\r?\\n)`));

const NUMBER = new TokenRegex('NUMBER', xRegExp(`([-+]?       # Sign
                                                 \\d*         # Digits
                                                 \\.?\\d+     # Decimals
                                                 (?:[eE][-+]?\\d+)?) # Exp not`,
                                                 'yx'));

const STRING = new TokenRegex('STRING', xRegExp(`"([^"\\\\]*)"`, 'yx'));
const WORD = new TokenRegex('WORD',
  xRegExp(`(\\[\\]|:=|[^\\s\\(\\)\\{\\}\\[\\]\\.,:"]+)`, 'yx'));

const LP = new TokenRegex('LP', xRegExp(`([\\(\\{\\[\\.])`, 'yx'));
const RP = new TokenRegex('RP', xRegExp(`([\\)\\}\\]])`, 'yx'));
const COMMA = new TokenRegex('COMMA', xRegExp(`(,|:(?!=))`, 'yx'));
const REGEX = new TokenRegex('REGEX', xRegExp(`(r/[^]*?/[nsxAgimuy]*)`, 'yx'));

module.exports = {
  WHITES,
  NEWLINE,
  NUMBER,
  STRING,
  WORD,
  LP,
  RP,
  COMMA,
  REGEX
};
