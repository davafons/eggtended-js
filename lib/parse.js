const tokenRegex = require('./tokenRegex.js');
const fs = require('fs');
const xRegExp = require('xregexp');
const utils = require('./utils.js');

class Parser {
  constructor() {
    this.lastIndex = 0;
    this.line = 1;
    this.lookahead = null;
  }

  setProgram(program) {
    this.program = program;

    this.lastIndex = 0;
    this.line = 1;
    this.lookahead = null;

    return this;
  }

  parse(program) {
    this.setProgram(program);

    this.lookahead = this._nextToken();

    // Result tree
    const result = (this.lookahead !== null) ? this.parseExpression() : null;

    if(this.lookahead !== null) {
      throw this._parserSyntaxError('Unexpected input after the end of file.');
    }

    return result;
  }

  parseFromFile(file) {
    const program = fs.readFileSync(file, 'utf8');
    const tree = this.parse(program);
    return tree;
  }

  getParBalance(program) {
    this.setProgram(program);

    let stack = 0;

    let token = this._nextToken();
    while(token !== null) {
      if(token.type === 'LP') {
        ++stack;
      } else if (token.type === 'RP') {
        --stack;
      }

      token = this._nextToken();
    }

    return stack;
  }

  parseExpression() {
    // STRING | NUMER
    let expr;
    if(this.lookahead.type === 'STRING') {
      expr = {type: 'value', value: this.lookahead.value };

    } else if (this.lookahead.type === 'NUMBER'){
      expr = {type: 'value', value: Number(this.lookahead.value)};

    } else if (this.lookahead.type === 'REGEX') {
      expr = {type: 'value', value: this._createRegex(this.lookahead.value) };

    } else if (this.lookahead.type === 'WORD') {
      expr = {type: 'word', name: this.lookahead.value };

    } else {
      throw this._parserSyntaxError('Unrecognized token while parsing the expression.');
    }

    return this.parseApply(expr);
  }

  parseApply(expr) {
    // Get next token
    this.lookahead = this._nextToken();

    // Return if apply is empty (not left parenthesis or null)
    if (!this.lookahead || this.lookahead.type !== 'LP') {
      return expr;
    }

    let tree = {type: 'apply', operator: expr, args: []};

    this.lookahead = this._nextToken();
    // Parse all arguments inside the parenthesis
    while(this.lookahead && this.lookahead.type !== 'RP') {
      let arg = this.parseExpression();
      tree.args.push(arg);

      if(!this.lookahead || (this.lookahead.type !== 'COMMA' &&
        this.lookahead.type !== 'RP')) {
        throw this._parserSyntaxError(`Missing , or ) after the expression`);
      }

      // Don't consume RPs as argument tokens
      if(this.lookahead && this.lookahead.type !== 'RP') {
        this.lookahead = this._nextToken();
      }
    }

    return this.parseApply(tree);
  }

  _nextToken() {
    const token = this._getToken();

    if(token && token.type === 'WORD') {
      const nextToken = this._peekNextToken();

      if(nextToken && nextToken.value === ':') {
        token.type = 'STRING';
      }
    }

    return token;
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
    for(let i = 0; i < Parser.TOKENS.length; ++i) {
      let match = Parser.TOKENS[i].exec(this.program);

      // When matching a expression, add the current line and set the token
      if(match !== null) {
        match.line = this.line;
        this.lastIndex = Parser.TOKENS[i].lastIndex;

        token = match;
        break;
      }
    }

    // Return the matched token, or null if anything was found
    return token;
  }

  _peekNextToken() {
    const savedIndex = this.lastIndex;
    const token = this._getToken();
    this.lastIndex = savedIndex;
    this._updateLastIndices();

    return token;
  }

  _createRegex(regexString) {
    const regexParts = regexString.split('/');
    const body = regexParts[1];
    const flags = regexParts[2];

    return new xRegExp(body, flags);
  }

  _updateLastIndices() {
    Parser.TOKENS.forEach((expr) => {
      expr.lastIndex = this.lastIndex;
    });
    tokenRegex.WHITES.lastIndex = this.lastIndex;
    tokenRegex.NEWLINE.lastIndex = this.lastIndex;
  }

  _parserSyntaxError(message) {
    let start = (this.lookahead) ? this.lookahead.start : this.lastIndex;

    return new SyntaxError(`Parser::Line ${this.line}::Col ${start}\n${message}\n${this.program.slice(start - 1, start + 10)}`);
  }

}

Parser.TOKENS = [tokenRegex.REGEX, tokenRegex.NUMBER, tokenRegex.STRING, tokenRegex.WORD,
      tokenRegex.LP, tokenRegex.RP, tokenRegex.COMMA];

module.exports = {
  Parser
};
