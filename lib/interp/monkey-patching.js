//  SUB
const utils = require('../utils.js');

Object.prototype.sub = function(...indices) {
  utils.checkIterable(this, indices.length);

  // Get index
  let index = indices[0];
  if(this instanceof Array) {
    index = utils.getValidIndex(this.length, indices[0]);
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
};

// SETELEM

Object.prototype.setelem = function(value, ...indices) {
  utils.checkIterable(this, indices.length);

  // Get index
  let index = indices[0];
  if(this instanceof Array) {
    index = utils.getValidIndex(this.length, indices[0]);
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
};

// NUMBER

['+', '-', '*', '/'].forEach((op) => {
  Number.prototype[op] = new Function('...values', `return [this, ...values].reduce((a, b) => a ${op} b);`);
});

Number.prototype['__missing__'] = Number.prototype['+'];
