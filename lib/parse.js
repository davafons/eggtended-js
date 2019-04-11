const XRegExp = require("xregexp");
const inspect = require("util").inspect;

const TOKENS = require("./tokenRegex");

console.log(TOKENS);

const ins = (x) => inspect(x, {depth: null});

class Lexer {
  constructor(program) {
    this.program = program;
    this.lastIndex = 0;

    Lexer.WHITES = XRegExp(`(\\s|     # space
                            [#;].*|   # comments
                            \\/\\*(.|\n)*?\\*\\/)* # EOL`,
                            'yx');

    // const STRING = XRegExp(`"((?:[^"\\]|\\.)*)"`, 'y'); # not working
    Lexer.STRING = /"((?:[^"\\]|\\.)*)"/y;
    Lexer.NUMBER = XRegExp(`([-+]?    # Sign
                            \\d*      # Digits
                            \\.?\\d+  # Decimals
                            ([eE][-+]?\\d+)?) # Exponential notation`,
                            'yx');

    Lexer.WORD   = XRegExp(`([^\\s(),"]+) # Spaces and alphanumeric words
                            `, 'yx')

    Lexer.LP     = XRegExp('\\(|{', 'y');
    Lexer.RP     = XRegExp('\\)|}', 'y');
    Lexer.COMMA  = XRegExp(',', 'y');
    Lexer.NEWLINE = XRegExp('\\r?\\n');

    Lexer.TOKENS = [Lexer.WORD, Lexer.LP];
  }
}

let lexer = new Lexer("+(a, 10)");
lexer.getNextToken();
