const inspect = require('util').inspect;
const ins = (x) => inspect(x, {depth: 'null'});

const _chunk = function*(arr, step) {
  for(let i = 0; i < arr.length; i += step) {
    yield arr.slice(i, i + step);
  }
};

const _checkIterable = (object, length) => {
  if(length === 0) {
    throw new SyntaxError('At least one index must be passed to sub');
  }

  if(object instanceof Number || object instanceof String) {
    throw new TypeError(`The object '${object}'' is not indexable!`);
  }
};

const _getValidIndex = (length, index) => {
  if (index < 0) {
    index = length + index;
  }

  if(index > length) {
    throw new RangeError(`Index ${index} is out of bounds. Array size: ${length}`);
  }

  return index;
};

module.exports = {
  _chunk,
  _checkIterable,
  _getValidIndex,
  ins
};
