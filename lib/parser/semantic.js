const estraverse = require("estraverse");

const { TopEnv, SpecialForms } = require("../interp/environment.js");
const { Apply, Word } = require("../interp/ast.js");

const SCOPE_OPERATORS = ["do", "if", "while", "for", "foreach", "fun", "->", "object"];
const DEFINE_OPERATORS = [":=", "define", "def"];
const SET_OPERATORS = ["set", "<-"];
const FUNCTION_OPERATORS = ["fun", "->"];
const OBJECT_OPERATORS = ["object", "obj"];

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
      enter: function(node, parent) {
        if (node.type === "apply") {
          node = methods.checkApplyEnter(node);
        } else if (node.type === "word") {
          node = methods.checkWordEnter(node, parent);
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
      },
      fallback: "iteration"
    });

    return tree;
  }

  static check(tree) {
    return new Semantic().check(tree);
  }

  checkApplyEnter(node) {
    if (node.operator.type == "word") {
      const operator_name = node.operator.name;

      // Assert that the arguments passed to the apply are correct
      this.assertApplyArgs(node);

      // If entered on a new scope, create a child symboltable
      if (SCOPE_OPERATORS.includes(operator_name)) {
        this.symboltable = Object.create(this.symboltable);
      }

      // If the operator is a "define" operator, add the new symbol to the symboltable
      if (DEFINE_OPERATORS.includes(operator_name)) {
        node.args[0] = this.addToSymboltable(node.args[0]);
      }

      if (SET_OPERATORS.includes(operator_name)) {
        const symbol = this.findInSymboltable(node.args[0].name);

        if (symbol && symbol.const) {
          throw new TypeError(`${node.args[0].name} is const and can't be reassigned!`);
        }
      }

      // Add function arguments to function symboltable
      if (FUNCTION_OPERATORS.includes(operator_name)) {
        for (let i = 0; i < node.args.length - 1; ++i) {
          this.addToSymboltable(node.args[i]);
        }
      }

      // Add "this" symbol, and object properties, to object symboltable
      if (OBJECT_OPERATORS.includes(operator_name)) {
        const apply = new Apply(new Word({ value: "const" }));
        apply.args = [new Word({ value: "this" })];

        this.addToSymboltable(apply);

        for (let i = 0; i < node.args.length; i += 2) {
          this.addToSymboltable(new Word({ value: node.args[i].value }));
        }
      }

      // Add the "iterator" symbol to foreach symboltable
      if (operator_name === "foreach") {
        this.addToSymboltable(node.args[0]);
      }
    }

    return node;
  }

  assertApplyArgs(node) {
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
      const match_error = (index, error_msg) => {
        return new TypeError(
          `The ${index}º argument doesn't match the expectation: "${error_msg}"`
        );
      };

      if (operator.args_expect !== undefined) {
        for (let i = 0; i < operator.args_expect.length; ++i) {
          if (!operator.args_expect[i](node.args[i])) {
            throw match_error(i + 1, operator.args_expect[i].error_msg);
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
            throw match_error(i + 1, operator.args_expect_firsts[i].error_msg);
          }
        }

        for (let i = 0; i < midArgs.length; ++i) {
          const expect_index = i % operator.args_expect_mid.length;

          if (!operator.args_expect_mid[expect_index](midArgs[i])) {
            throw match_error(
              i + firstArgsLen + 1,
              operator.args_expect_mid[expect_index].error_msg
            );
          }
        }

        for (let i = 0; i < lastArgs.length; ++i) {
          if (!operator.args_expect_lasts[i](lastArgs[i])) {
            throw match_error(
              i + firstArgsLen + lastArgsStartIndex,
              operator.args_expect_lasts[i].error_msg
            );
          }
        }
      }
    }
  }

  addToSymboltable(node) {
    const traits = {};

    // Accumulate all the traits (const, types [not implemented], ...)
    while (node.type === "apply") {
      if (node.operator.name === "const") {
        traits["const"] = true;

        node = node.args[0];
      }
    }

    // Add to the symboltable only if not const
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

  findInSymboltable(name) {
    // Find an element on the symboltable or the parent ones
    for (let table = this.symboltable; table; table = Object.getPrototypeOf(table)) {
      if (Object.prototype.hasOwnProperty.call(table, name)) {
        return table[name];
      }
    }

    return undefined;
  }

  checkWordEnter(node, parent) {
    if (!node.name.match("__.*__")) {
      const symbol = this.findInSymboltable(node.name);

      if (symbol === undefined && parent.operator.name !== "fun") {
        throw new ReferenceError(`Trying to use the undefined symbol ${node.name}`);
      }
    }

    return node;
  }

  checkApplyLeave(node) {
    if (node.operator.type == "word") {
      const operator_name = node.operator.name;

      // If left the scope, remove the last symboltable
      if (SCOPE_OPERATORS.includes(operator_name)) {
        this.symboltable = Object.getPrototypeOf(this.symboltable);
      }
    }

    return node;
  }
}

module.exports = {
  Semantic
};
