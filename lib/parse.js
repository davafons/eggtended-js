const tokenRegex = require("./tokenRegex.js");

class Parser {
  constructor() {
    this.lastIndex = 0;
    this.line = 1;
    this.lookahead = null;

    Parser.TOKENS = [tokenRegex.NUMBER, tokenRegex.STRING, tokenRegex.WORD,
      tokenRegex.LP, tokenRegex.RP, tokenRegex.COMMA]
  }

  get program() {
    return this.program_str;
  }

  set program(program_str) {
    this.program_str = program_str;

    this.lastIndex = 0;
    this.line = 1;
    this.lookahead = null;

    return this;
  }

  parse(program_str) {
    this.program = program_str;

    const result = this.parseExpression();

    if(this.lookahead !== null) {
      console.log("More input than expected");
    }

    return result;
  }

  parseExpression() {
    this.lookahead = this.getToken();
    console.log("Enter parseExpression with: " + this.lookahead.value);

    if(this.lookahead.type === "STRING" || this.lookahead.type === "NUMBER") {
      return {type: "value", value: this.lookahead.value };

    } else if (this.lookahead.type === "WORD") {
      let expr = {type: "word", name: this.lookahead.value };

      return this.parseApply(expr);
    }
  }

  getToken() {
    // Update lastIndex property for each expression used
    this._updateLastIndices();

    // Match and ignore whitespaces and newlines
    let whitespaces = tokenRegex.WHITES.exec(this.program);
    if(whitespaces !== null) {
      if(tokenRegex.NEWLINE.exec(whitespaces.value)) {
        ++this.line;
      }
      this.lastIndex = tokenRegex.WHITES.lastIndex;

      return this.getToken();
    }

    // Iterate through each regex
    let token = null;
    Parser.TOKENS.forEach((expr) => {
      let match = expr.exec(this.program);

      // When matching a expression, add the current line and set the token
      if(match !== null) {
        match.line = this.line;
        this.lastIndex = expr.lastIndex;

        token = match;
        return;
      }
    });

    // Return the matched token, or null if anything was found
    return token;
  }

  parseApply(expr) {
    console.log("Entered parseApply");

    // Get next token
    this.lookahead = this.getToken();

    // Return if apply is empty (not left parenthesis or null)
    if (!this.lookahead || this.lookahead.type !== "LP") {
      return expr;
    }

    let tree = {type: "apply", operator: expr, args: []};

    // Parse all arguments inside parenthesis
    let argument = this.parseExpression();
    while(this.lookahead && this.lookahead.type !== "RP") {
      console.log(argument);
      argument = this.parseExpression();
    }

    // After parsing all arguments, lookahead token should be in )
    this.lookahead = this.getToken();

    if(!this.lookahead) {
      return tree;
    }

    // Call parseApply if there are more parenthesis after the current apply
    // ()()
    return this.parseApply(tree);
  }

  _updateLastIndices() {
    Parser.TOKENS.forEach((expr) => {
      expr.lastIndex = this.lastIndex;
    });
    tokenRegex.WHITES.lastIndex = this.lastIndex;
    tokenRegex.NEWLINE.lastIndex = this.lastIndex;
  }
}

let p = new Parser();
console.log(p.parse("do()"))
console.log(p.parse("do{}"))
