Array.prototype.sub = function(index) {
  return this[index];
};

['+', '-', '*', '/'].forEach((op) => {
  Number.prototype[op] = new Function('...values', `return [this, ...values].reduce((a, b) => a ${op} b);`);
});

Number.prototype['missing'] = Number.prototype['+'];
