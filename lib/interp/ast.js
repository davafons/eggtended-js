// AST class nodes
const xRegExp = require('xregexp');
const utils = require('../utils.js');

const {SpecialForms} = require('./environment.js');

class Value {
  constructor(token) {
    this.type = 'value';
    this.value = token.value;
  }

  evaluate() {
    return this.value;
  }
}

class Word {
  constructor(token) {
    this.type = 'word';
    this.name = token.value;
  }

  evaluate(env) {
    // Variable
    if (this.name in env) {
      return env[this.name];

    // Variable in const scope
    } else if (this.name in env["__const__"]){
      return env["__const__"][this.name];

      // Object variable referenced without using 'this'
    } else if ('this' in env && this.name in env['this']) {
      return env['this'][this.name];

    } else {
      throw new ReferenceError(`Undefined variable: ${this.name}`);
    }
  }
}

class Apply {
  constructor(expr) {
    this.type = 'apply';
    this.operator = expr;
    this.args = [];
  }

  evaluate(env) {
    // Check if its a specialForm function
    if (this.operator.type === 'word' && this.operator.name in SpecialForms) {
      return SpecialForms[this.operator.name](this.args, env);
    }

    // Evaluated operator
    let op = this.operator.evaluate(env);
    // Evaluated arguments
    let evArgs = this.args.map((arg) => arg.evaluate(env));

    if(typeof op === 'function') { // Is a function
      return op(...evArgs);
    }

    if(typeof op !== 'undefined') { // Is an object, number, string or boolean
      let name = evArgs[0];
      let methodArgs = evArgs.slice(1);

      // Check if the name of the method/property is defined on the object
      if(typeof op[name] !== 'undefined') {
        // Execute as function
        if(typeof op[name] === 'function') {
          return op[name](...methodArgs);

        // Return as property
        } else {
          return op[name];
        }

      // If the name of the method is not defined on the object...
      } else {
        // Check if its a Map property.
        if(op instanceof Map) {
          if(typeof op.get(name) === 'function') {
            return op.get(name)(...methodArgs);
          } else {
            return op.get(name);
          }
        }

        // Try to call the 'missing' method
        if(typeof op['__missing__'] === 'function') {
          return op['__missing__'](...methodArgs);

        // As a last resort, throw an Exception
        } else {
          throw new SyntaxError(`The method '${name}' was not found on the
          object '${utils.ins(op)}'`);
        }
      }
    }

    throw new TypeError(`Could not resolve the apply expression`);
  }
}

class Regex {
  constructor(token) {
    this.type = 'regex';

    this.body = token.body;
    this.flags = token.flags;
  }

  evaluate() {
    return new xRegExp(this.body, this.flags);
  }
}

module.exports = {
  Value, Word, Apply, Regex
}
