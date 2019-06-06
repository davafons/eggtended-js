const estraverse = require("estraverse");

const { TopEnv, SpecialForms } = require("../interp/environment.js");
const { Parser } = require("../parser/parse.js");

const SCOPE_OPERATORS = ["do", "if", "while", "for", "foreach", "fun", "->", "object"];
const SET_OPERATORS = [":=", "define", "def", "set", "="];

class Semantic {
  constructor() {
    this.symboltable = Object.create(null);
  }

  check(tree) {
    const methods = this;

    estraverse.traverse(tree, {
      enter: function(node) {
        if (node.type === "apply") {
          methods.checkApplyEnter(node);
        }
      },
      leave: function(node) {
        if (node.type === "apply") {
          methods.checkApplyLeave(node);
        }
      },
      keys: {
        apply: ["args"],
        word: [],
        value: [],
        regex: []
      }
    });
  }

  static check(tree) {
    return new Semantic().check(tree);
  }

  checkApplyEnter(node) {
    if (node.operator.type == "word") {
      const operator_name = node.operator.name;

      // Check if operator is defined in SpecialForms
      let operator =
        operator_name in SpecialForms ? SpecialForms[operator_name] : undefined;

      // Check if operator is defined in TopEnv
      if (operator === undefined) {
        operator = operator_name in TopEnv ? TopEnv[operator_name] : undefined;
      }

      // Check that the number of argument passed to the operator is correct
      if (
        operator !== undefined &&
        operator.n_args !== undefined &&
        !operator.n_args(node.args.length)
      ) {
        throw new SyntaxError(
          `Bad number of args passed to ${operator_name}. (Got: ${
            node.args.length
          }. Expected: ${operator.n_args})`
        );
      }

      if (SCOPE_OPERATORS.includes(operator_name)) {
        this.symboltable = Object.create(this.symboltable);
      }

      if (SET_OPERATORS.includes(operator_name)) {
        this.addToSymboltable(node.args[0]);
      }
    }
    // console.log(this.symboltable);
  }

  addToSymboltable(node) {
    const traits = {};

    while (node.type === "apply") {
      if (node.operator.name === "const") {
        traits["const"] = true;

        node = node.args[0];
      }
    }

    if (node.name in this.symboltable && this.symboltable[node.name].const) {
      throw new TypeError(`${node.name} is const and can't be reassigned!`);

    } else {
      this.symboltable[node.name] = traits;
    }
  }

  checkApplyLeave(node) {
    if (node.operator.type == "word") {
      const operator_name = node.operator.name;

      if (SCOPE_OPERATORS.includes(operator_name)) {
        this.symboltable = Object.getPrototypeOf(this.symboltable);
      }
    }

    // console.log(this.symboltable);
  }
}

const tree = Parser.parse("do(:=(const(x), 3))");

Semantic.check(tree);

module.exports = {
  Semantic
};
