const estraverse = require("estraverse");

const { Parser } = require("./parse.js");
const { TopEnv, SpecialForms } = require("../interp/environment.js");

class Semantic {
  check(tree) {
    const parent = this;

    estraverse.traverse(tree, {
      enter: function(node) {
        if (node.type === "apply") {
          parent.apply(node);
        }
      },
      keys: {
        apply: ["args"],
        word: [],
        value: []
      }
    });
  }

  static check(tree) {
    return new Semantic().check(tree);
  }

  apply(node) {
    if (node.operator.type == "word" && node.operator.name in SpecialForms) {
      const operator_name = node.operator.name;

      // Check that the number of argument passed is correct
      if (!SpecialForms[operator_name].n_args(node.args.length)) {
        throw new SyntaxError(`Bad number of args passed to ${operator_name}`);
      }
    }
  }
}

const tree = Parser.parse('do(while(true, print("3")))');

Semantic.check(tree);
