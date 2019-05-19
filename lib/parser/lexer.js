const tokenRegex = require("./tokenRegex.js");
const fs = require("fs");

class Lexer {
  constructor() {
    this.lastIndex = 0;
    this.line = 1;
  }

  setProgram(program) {
    this.program = program;

    this.lastIndex = 0;
    this.line = 1;

    return this;
  }

  tokenize(program) {
    this.setProgram(program);

    return this._getTokens();
  }

  static tokenize(program) {
    return new Lexer().tokenize(program);
  }

  tokenizeFromFile(file) {
    const program = fs.readFileSync(file, "utf-8");

    return this.tokenize(program);
  }

  static tokenizeFromFile(file) {
    return new Lexer().tokenizeFromFile(file);
  }

  static setTokens(tokens) {
    Lexer.TOKENS = tokens;
  }

  getParBalance(program) {
    this.setProgram(program);

    let stack = 0;
    const tokens = this._getTokens();
    for (const token of tokens) {
      if (token.type === "LP") {
        ++stack;
      } else if (token.type === "RP") {
        --stack;
      }
    }

    return stack;
  }

  _getTokens() {
    const tokens = [];

    let currentToken = this._getToken();
    while (currentToken !== null) {
      tokens.push(currentToken);

      currentToken = this._getToken();
    }

    return this.__transformTokens(tokens);
  }

  _getToken() {
    // Update lastIndex property for each expression used
    this.__updateLastIndices();

    // Match and ignore whitespaces and newlines
    let whitespaces = Lexer.WHITES.exec(this.program);
    if (whitespaces !== null) {
      if (Lexer.NEWLINE.exec(whitespaces.value)) {
        ++this.line;
      }
      this.lastIndex = Lexer.WHITES.lastIndex;

      return this._getToken();
    }

    // Iterate through each regex
    let token = null;
    for (let i = 0; i < Lexer.TOKENS.length; ++i) {
      let match = Lexer.TOKENS[i].exec(this.program);

      // When matching a expression, add the current line and set the token
      if (match !== null) {
        match.line = this.line;
        this.lastIndex = Lexer.TOKENS[i].lastIndex;

        token = match;
        break;
      }
    }

    // Return the matched token, or null if anything was found
    return token;
  }

  __transformTokens(tokens) {
    for (let i = 0; i < tokens.length; ++i) {
      // x: => "x",
      if (tokens[i].type === "WORD") {
        const nextToken = tokens[i + 1];
        if (nextToken && nextToken.value === ":") {
          tokens[i].type = "STRING";
        }
      }

      // Replace dots with parentehsis
      // a.b   =>    a("b")
      // a.b.c   =>  a("b")("c")
      // a.b(c, d)   => a("b", c, d)
      if (tokens[i].type === "LP" && tokens[i].value === ".") {
        tokens[i].value = "(";

        const expr = tokens[i + 1];
        const arg = tokens[i + 2];

        if (expr && expr.type === "WORD") {
          expr.type = "STRING";
        }

        if (arg && arg.type === "LP" && arg.value !== ".") {
          arg.type = "COMMA";
          arg.value = ",";
        } else {
          tokens.splice(i + 2, 0, { type: "RP", value: ")" });
        }
      }
    }

    return tokens;
  }

  __updateLastIndices() {
    Lexer.TOKENS.forEach(expr => {
      expr.lastIndex = this.lastIndex;
    });
    Lexer.WHITES.lastIndex = this.lastIndex;
    Lexer.NEWLINE.lastIndex = this.lastIndex;
  }
}

Lexer.TOKENS = [
  tokenRegex.NUMBER,
  tokenRegex.STRING,
  tokenRegex.REGEX,
  tokenRegex.WORD,
  tokenRegex.LP,
  tokenRegex.RP,
  tokenRegex.COMMA
];

Lexer.WHITES = tokenRegex.WHITES;
Lexer.NEWLINE = tokenRegex.NEWLINE;

module.exports = {
  Lexer
};
