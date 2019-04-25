const inspect = require('util').inspect;

const ins = (x) => inspect(x, {depth: 'null'});

const chunk = function*(arr, step) {
  for(let i = 0; i < arr.length; i += step) {
    yield arr.slice(i, i + step);
  }
};

const checkIterable = (object, length) => {
  if(length === 0) {
    throw new SyntaxError('At least one index must be passed to sub');
  }

  if(object instanceof Number || object instanceof String) {
    throw new TypeError(`The object '${object}'' is not indexable!`);
  }
};

const getValidIndex = (length, index) => {
  if (index < 0) {
    index = length + index;
  }

  if(index > length) {
    throw new RangeError(`Index ${index} is out of bounds. Array size: ${length}`);
  }

  return index;
};

module.exports = {
  chunk,
  checkIterable,
  getValidIndex,
  ins
};
