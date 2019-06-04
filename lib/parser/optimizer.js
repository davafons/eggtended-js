const estraverse = require("estraverse");

const { ARITHM_OPERATORS } = require("../interp/registry.js");
const { Eggvm } = require("../interp/eggvm.js");
const { Value } = require("../interp/ast.js");

class Optimizer {
  static optimize(tree) {
    const optimized_tree = estraverse.replace(tree, {
      leave: function(node) {
        if (node.type === "apply") {
          // If all arguments are literals, substitute the node with the result of the
          // evaluation
          if (
            ARITHM_OPERATORS.includes(node.operator.name) &&
            node.args.every(arg => arg.type === "value")
          ) {
            const result = Eggvm.eval(node);

            return new Value({ value: result });
          }
        }
      },
      keys: {
        apply: ["operator", "args"],
        word: [],
        value: []
      }
    });

    return optimized_tree;
  }
}

module.exports = {
  Optimizer
};
