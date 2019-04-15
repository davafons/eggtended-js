const tokenRegex = require("./tokenRegex.js");
const inspect = require("util").inspect;
const ins = (x) => inspect(x, {depth: null});
const fs = require("fs");

class Parser {
  constructor() {
    this.lastIndex = 0;
    this.line = 1;
    this.lookahead = null;

    Parser.TOKENS = [tokenRegex.NUMBER, tokenRegex.STRING, tokenRegex.WORD,
      tokenRegex.LP, tokenRegex.RP, tokenRegex.COMMA]
  }

  getProgram() {
    return this.program;
  }

  setProgram(program) {
    this.program = program;

    this.lastIndex = 0;
    this.line = 1;
    this.lookahead = null;

    return this;
  }

  parse(program) {
    this.program = program;

    const result = this.parseExpression();

    if(this.lookahead !== null) {
      console.log("More input than expected");
    }

    return result;
  }

  parseFromFile(file) {
    try {
      const program = fs.readFileSync(file, 'utf8');
      const tree = this.parse(program);
      const json = JSON.stringify(tree, null, "  ");
      /* fs.writeFileSync(file+".evm", json); */
      return tree;

    } catch(err) {
      console.log(err);
    }
  }

  parseExpression() {
    this.lookahead = this.getToken();

    // STRING | NUMER
    if(this.lookahead.type === "STRING") {
      return {type: "value", value: this.lookahead.value };

    } else if (this.lookahead.type === "NUMBER"){
      return {type: "value", value: Number(this.lookahead.value)};

    } else if (this.lookahead.type === "WORD") {
      let expr = {type: "word", name: this.lookahead.value };

      return this.parseApply(expr);
    }
  }

  parseApply(expr) {
    // Get next token
    this.lookahead = this.getToken();

    // Return if apply is empty (not left parenthesis or null)
    if (!this.lookahead || this.lookahead.type !== "LP") {
      return expr;
    }

    let tree = {type: "apply", operator: expr, args: []};

    // Parse all arguments inside parenthesis
    while(this.lookahead && this.lookahead.type !== "RP") {
      let arg = this.parseExpression();
      tree.args.push(arg);

      // Get next token if read a literal value
      if(arg.type == "value") {
        this.lookahead = this.getToken();
      }

      if(!this.lookahead || (this.lookahead.type !== "COMMA" &&
        this.lookahead.type !== "RP")) {
        console.log("Missing , or )");
      }
    }

    // After parsing all arguments, lookahead token should be in ) or ,
    this.lookahead = this.getToken();

    // Call parseApply if there are more parenthesis after the current apply
    // ()() [TODO]
    return tree;
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

  _updateLastIndices() {
    Parser.TOKENS.forEach((expr) => {
      expr.lastIndex = this.lastIndex;
    });
    tokenRegex.WHITES.lastIndex = this.lastIndex;
    tokenRegex.NEWLINE.lastIndex = this.lastIndex;
  }
}

let p = new Parser();
p.parseFromFile("examples/one.egg");

module.exports = {
  Parser
}
