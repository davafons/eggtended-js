const tokenRegex = require('./tokenRegex.js');
const fs = require('fs');

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

  // TODO: move getParBalance here from Parser


  _getTokens() {
    const tokens = [];

    let currentToken = this._getToken();
    while(currentToken !== null) {
      tokens.push(currentToken);

      currentToken = this._getToken();
    }

    return this._transformTokens(tokens);
  }

  _getToken() {
    // Update lastIndex property for each expression used
    this._updateLastIndices();

    // Match and ignore whitespaces and newlines
    let whitespaces = tokenRegex.WHITES.exec(this.program);
    if(whitespaces !== null) {
      if(tokenRegex.NEWLINE.exec(whitespaces.value)) {
        ++this.line;
      }
      this.lastIndex = tokenRegex.WHITES.lastIndex;

      return this._getToken();
    }

    // Iterate through each regex
    let token = null;
    for(let i = 0; i < Lexer.TOKENS.length; ++i) {
      let match = Lexer.TOKENS[i].exec(this.program);

      // When matching a expression, add the current line and set the token
      if(match !== null) {
        match.line = this.line;
        this.lastIndex = Lexer.TOKENS[i].lastIndex;

        token = match;
        break;
      }
    }

    // Return the matched token, or null if anything was found
    return token;
  }

  // a.b   =>    a("b")
  // a.b.c   =>  a("b")("c")
  // a.b(c, d)   => a("b", c, d)

  _transformTokens(tokens) {
    console.log("Transforming");
    for(let i = 0; i < tokens.length; ++i) {
      if(tokens[i].type === 'WORD') {
        const nextToken = tokens[i + 1];

        if(nextToken && nextToken.value === ':') {
          tokens[i].type = 'STRING';
        }
      }
    }

    return tokens;
  }

  _updateLastIndices() {
    Lexer.TOKENS.forEach((expr) => {
      expr.lastIndex = this.lastIndex;
    });
    tokenRegex.WHITES.lastIndex = this.lastIndex;
    tokenRegex.NEWLINE.lastIndex = this.lastIndex;
  }

}

Lexer.tokenize = (program) => {
  const lexer = new Lexer();
  lexer.setProgram(program);

  return lexer._getTokens();
}

Lexer.tokenizeFromFile = (file) => {
  const program = fs.readFileSync(file, 'utf8');

  return Lexer.tokenize(program);
}

Lexer.TOKENS = [tokenRegex.NUMBER, tokenRegex.STRING, tokenRegex.REGEX,
  tokenRegex.WORD, tokenRegex.LP, tokenRegex.RP, tokenRegex.COMMA];

module.exports = {
  Lexer
}
