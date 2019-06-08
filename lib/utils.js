const inspect = require("util").inspect;

const ins = x => inspect(x, { depth: "null" });

const chunk = function*(arr, step) {
  for (let i = 0; i < arr.length; i += step) {
    yield arr.slice(i, i + step);
  }
};

const checkIterable = (object, length) => {
  if (length === 0) {
    throw new SyntaxError("At least one index must be passed to sub");
  }

  if (object instanceof Number || object instanceof String) {
    throw new TypeError(`The object '${object}'' is not indexable!`);
  }
};

const getValidIndex = (length, index) => {
  if (index < 0) {
    index = length + index;
  }

  if (index > length) {
    throw new RangeError(`Index ${index} is out of bounds. Array size: ${length}`);
  }

  return index;
};

const isIterable = obj => {
  if (obj === null) {
    return false;
  }

  return typeof obj[Symbol.iterator] === "function";
};

const isAny = () => {
  return true;
};

const isWord = node => {
  return node.type === "word";
};
isWord.error_msg = "The argument must be a Word.";

const isApply = node => {
  return node.type === "apply";
};
isApply.error_msg = "The argument must be an Apply.";

const isValue = node => {
  return node.type === "value";
};
isValue.error_msg = "The argument must be a Value.";

const isUnion = (...expects) => {
  const unionFun = node => {
    for (let i = 0; i < expects.length; ++i) {
      if (expects[i](node)) {
        return true;
      }
    }

    return false;
  };

  unionFun.error_msg = expects.map(e => e.error_msg).join(" || ");

  return unionFun;
};
isUnion.error_msg = "";

module.exports = {
  chunk,
  checkIterable,
  getValidIndex,
  ins,
  isIterable,
  isAny,
  isWord,
  isApply,
  isValue,
  isUnion
};
