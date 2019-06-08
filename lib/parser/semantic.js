const estraverse = require("estraverse");

const { TopEnv, SpecialForms } = require("../interp/environment.js");

const SCOPE_OPERATORS = ["do", "if", "while", "for", "foreach", "fun", "->", "object"];
const SET_OPERATORS = [":=", "define", "def", "set", "="];

class Semantic {
  constructor(symboltable) {
    if (symboltable === undefined) {
      this.symboltable = Object.create(null);
    } else {
      this.symboltable = symboltable;
    }
  }

  check(tree) {
    const methods = this;

    tree = estraverse.replace(tree, {
      enter: function(node) {
        if (node.type === "apply") {
          node = methods.checkApplyEnter(node);
        }

        return node;
      },
      leave: function(node) {
        if (node.type === "apply") {
          node = methods.checkApplyLeave(node);
        }

        return node;
      },
      keys: {
        apply: ["args"],
        word: [],
        value: [],
        regex: []
      }
    });

    return tree;
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
      operator = operator_name in TopEnv ? TopEnv[operator_name] : operator;

      if (operator !== undefined) {
        // Check that the number of argument passed to the operator is correct
        if (operator.n_args !== undefined && !operator.n_args(node.args.length)) {
          throw new SyntaxError(
            `Bad number of args passed to ${operator_name}. (Got: ${
              node.args.length
            }. Expected: ${operator.n_args})`
          );
        }

        // Check that the passed arguments match all the expectations
        if (operator.args_expect !== undefined) {
          for (let i = 0; i < operator.args_expect.length; ++i) {
            if (!operator.args_expect[i](node.args[i])) {
              throw new TypeError(
                `The ${i + 1}º argument doesn't match the expectation: "${
                  operator.args_expect[i].error_msg
                }"`
              );
            }
          }
        }

        if (operator.args_expect_mid !== undefined) {
          const firstArgsLen =
            operator.args_expect_firsts !== undefined
              ? operator.args_expect_firsts.length
              : 0;

          const lastArgsLen =
            operator.args_expect_lasts !== undefined
              ? operator.args_expect_lasts.length
              : 0;

          const lastArgsStartIndex = node.args.length - lastArgsLen;

          const firstArgs = node.args.slice(0, firstArgsLen);
          const midArgs = node.args.slice(firstArgsLen, lastArgsStartIndex);
          const lastArgs = node.args.slice(lastArgsStartIndex);

          for (let i = 0; i < firstArgs.length; ++i) {
            if (!operator.args_expect_firsts[i](firstArgs[i])) {
              throw new TypeError(
                `The ${i + 1}º argument doesn't match the expectation: "${
                  operator.args_expect_firsts[i].error_msg
                }"`
              );
            }
          }

          for (let i = 0; i < midArgs.length; ++i) {
            const expect_index = i % operator.args_expect_mid.length;

            if (!operator.args_expect_mid[expect_index](midArgs[i])) {
              throw new TypeError(
                `The ${i + firstArgsLen + 1}º argument doesn't match the expectation: "${
                  operator.args_expect_mid[expect_index].error_msg
                }"`
              );
            }
          }

          for (let i = 0; i < lastArgs.length; ++i) {
            if (!operator.args_expect_lasts[i](lastArgs[i])) {
              throw new TypeError(
                `The ${i +
                  firstArgsLen +
                  lastArgsStartIndex +
                  1}º argument doesn't match the expectation: "${
                  operator.args_expect_lasts[i].error_msg
                }"`
              );
            }
          }
        }
      }

      if (SCOPE_OPERATORS.includes(operator_name)) {
        this.symboltable = Object.create(this.symboltable);

        // node.symboltable = this.symboltable;
      }

      if (SET_OPERATORS.includes(operator_name)) {
        node.args[0] = this.addToSymboltable(node.args[0]);
      }
    }
    // console.log(this.symboltable);
    return node;
  }

  addToSymboltable(node) {
    const traits = {};

    while (node.type === "apply") {
      if (node.operator.name === "const") {
        traits["const"] = true;

        node = node.args[0];
      }
    }

    if (
      Object.prototype.hasOwnProperty.call(this.symboltable, node.name) &&
      this.symboltable[node.name].const
    ) {
      throw new TypeError(`${node.name} is const and can't be reassigned!`);
    } else {
      this.symboltable[node.name] = traits;
    }

    return node;
  }

  checkApplyLeave(node) {
    if (node.operator.type == "word") {
      const operator_name = node.operator.name;

      if (SCOPE_OPERATORS.includes(operator_name)) {
        this.symboltable = Object.getPrototypeOf(this.symboltable);
      }
    }

    // console.log(this.symboltable);

    return node;
  }
}

module.exports = {
  Semantic
};
