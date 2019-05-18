const { Value, Word, Apply, Regex } = require("../interp/ast.js");
const utils = require("../utils.js");

const json2AST = tree => {
  let obj = null;

  if (tree.type == "apply") {
    obj = new Apply(tree);
    obj.operator = json2AST(tree.operator);
    obj.args = tree.args.map(arg => json2AST(arg));
  } else if (tree.type == "word") {
    obj = new Word(tree);
    obj.name = tree.name;
  } else if (tree.type == "value") {
    obj = new Value(tree);
  } else if (tree.type == "regex") {
    obj = new Regex(tree);
    obj.body = tree.body;
    obj.flags = tree.flags;
  } else {
    throw new SyntaxError(`Unrecognized token ${utils.ins(tree)}`);
  }

  return obj;
};

module.exports = {
  json2AST
};
