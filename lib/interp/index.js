const { Eggvm } = require("./eggvm.js");
const { Value, Word, Apply, Regex } = require("./ast.js");
const { TopEnv, SpecialForms  } = require("./environment.js");

module.exports = {
  Eggvm,
  Value,
  Word,
  Apply,
  Regex,
  TopEnv,
  SpecialForms
};
