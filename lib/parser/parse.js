const fs = require('fs');

const {Lexer} = require('./lexer.js');
const {Value, Word, Apply, Regex} = require('../interp/ast.js');

class Parser {
  constructor() {
    this.index = 0;
    this.tokens = [];
    this.lookahead = null;
  }

  setProgram(program) {
    this.program = program;

    this.index = 0;
    this.tokens = [];
    this.lookahead = null;

    return this;
  }

  parse(program) {
    this.setProgram(program);

    // Get array of tokens
    this.tokens = Lexer.tokenize(program);

    let tree = null;

    // Parse if the array is not empty
    if(this.tokens.length > 0) {
      this.lookahead = this.__nextToken();
      tree = this.parseExpression();
    }

    if(this.lookahead !== null) {
      throw this.__parserSyntaxError('Unexpected input after the end of file.');
    }

    return tree;
  }

  static parse(program) {
    return new Parser().parse(program);
  }

  parseFromFile(file) {
    const program = fs.readFileSync(file, 'utf8');

    return this.parse(program);
  }

  static parseFromFile(file) {
    return new Parser().parseFromFile(file);
  }


  parseExpression() {
    let expr;
    if(this.lookahead.type === 'STRING') {
      expr = new Value(this.lookahead);

    } else if (this.lookahead.type === 'NUMBER'){
      this.lookahead.value = Number(this.lookahead.value);
      expr = new Value(this.lookahead);

    } else if (this.lookahead.type === 'REGEX') {
      expr = new Regex(this.lookahead);

    } else if (this.lookahead.type === 'WORD') {
      expr = new Word(this.lookahead);

    } else {
      throw this.__parserSyntaxError('Unrecognized token while parsing the expression.');
    }

    return this.parseApply(expr);
  }

  parseApply(expr) {
    // Get next token
    this.lookahead = this.__nextToken();

    // Return if apply is empty (not left parenthesis or null)
    if (!this.lookahead || this.lookahead.type !== 'LP') {
      return expr;
    }

    let tree = new Apply(expr);

    this.lookahead = this.__nextToken();
    // Parse all arguments inside the parenthesis
    while(this.lookahead && this.lookahead.type !== 'RP') {
      let arg = this.parseExpression();
      tree.args.push(arg);

      if(!this.lookahead || (this.lookahead.type !== 'COMMA' &&
        this.lookahead.type !== 'RP')) {
        throw this.__parserSyntaxError(`Missing , or ) after the expression`);
      }

      // Don't consume RPs as argument tokens
      if(this.lookahead && this.lookahead.type !== 'RP') {
        this.lookahead = this.__nextToken();
      }
    }

    return this.parseApply(tree);
  }

  __nextToken() {
    const token = this.tokens[this.index++];

    return (token !== undefined) ? token : null;
  }

  __parserSyntaxError(message) {
    let start = (this.lookahead) ? this.lookahead.start : this.lastIndex;

    return new SyntaxError(`Parser::Line ${this.line}::Col ${start}\n${message}\n${this.program.slice(start - 1, start + 10)}`);
  }
}

module.exports = {
  Parser
};
