//  SUB

Object.prototype.sub = function(...indices) {
  _checkIterable(this, indices.length);

  // Get index
  let index = indices[0];
  if(this instanceof Array) {
    index = _getValidIndex(this.length, indices[0]);
  }

  // Get value
  let value;
  if(this instanceof Map) {
    value = this.get(index);
  } else {
    value = this[index];
  }

  // Return value or keep recursion
  if(indices.length === 1) {
    return value;
  }

  return value.sub(...indices.slice(1));
}

// SETELEM

Object.prototype.setelem = function(value, ...indices) {
  _checkIterable(this, indices.length);

  // Get index
  let index = indices[0];
  if(this instanceof Array) {
    index = _getValidIndex(this.length, indices[0]);
  }

  // Set value or continue the recursion
  if(indices.length === 1) {

    if(this instanceof Map) {
      this.set(index, value);
    } else {
      this[index] = value;
    }

    return value;
  }

  const obj = this.sub(index);
  return obj.setelem(value, ...indices.slice(1));
}

// Helper functions

function _checkIterable(object, length) {
  if(length === 0) {
    throw new SyntaxError("At least one index must be passed to sub");
  }

  if(object instanceof Number || object instanceof String) {
    throw new TypeError(`The object '${object}'' is not indexable!`);
  }
}

function _getValidIndex(length, index) {
  if (index < 0) {
    index = length + index;
  }

  if(index > length) {
    throw new RangeError(`Index ${index} is out of bounds. Array size: ${length}`);
  }

  return index;
}

// NUMBER

['+', '-', '*', '/'].forEach((op) => {
  Number.prototype[op] = new Function('...values', `return [this, ...values].reduce((a, b) => a ${op} b);`);
});

Number.prototype['__missing__'] = Number.prototype['+'];
