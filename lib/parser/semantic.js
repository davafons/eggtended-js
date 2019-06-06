const estraverse = require("estraverse");

const { Parser } = require("./parse.js");
const { TopEnv, SpecialForms } = require("../interp/environment.js");

class Semantic {
  check(tree) {
    const methods = this;

    estraverse.traverse(tree, {
      enter: function(node) {
        if (node.type === "apply") {
          methods.checkApply(node);
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

  checkApply(node) {
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
    }
  }
}

module.exports = {
  Semantic
};
