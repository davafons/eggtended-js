Array.prototype.sub = function(...indices) {
  // TODO: Move the index checking function to this method
  let result = this;

  indices.forEach((index) => {
    result = result[index];
  });

  return result;
};

['+', '-', '*', '/'].forEach((op) => {
  Number.prototype[op] = new Function('...values', `return [this, ...values].reduce((a, b) => a ${op} b);`);
});

Number.prototype['missing'] = Number.prototype['+'];

Map.prototype.sub = function(...indices) {
  // TODO: Move the index checking function to this method
  let result = this;

  indices.forEach((index) => {
    result = result.get(index);
  });

  return result;
};
