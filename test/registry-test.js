const should = require('should');

const {Eggvm} = require('../lib/eggvm.js');

describe('Test SpecialForms', () => {

  describe('do(...)', () => {
    it('should return the argument Eggvm.luated', () => {
      Eggvm.run('do(3)').should.be.eql(3);
      Eggvm.run('do("hola")').should.be.eql('hola');
    });

    it('should return the result of the Eggvm.luated expression', () => {
      Eggvm.run('do(if(true, 3, 4))').should.be.eql(3);
    });
  });

  describe('if(cond, v1, v2)', () => {
    it('should return the first argument if Eggvm.luates to true', () => {
      Eggvm.run('if(true, 3, 4)').should.be.eql(3);
    });

    it('should return the second argument if Eggvm.luates to false', () => {
      Eggvm.run('if(false, 3, 4)').should.be.eql(4);
    });

    it('should throw SyntaxError if not passing exactly 3 arguments', () => {
      should.throws(() => { Eggvm.run('if(true, 3)'); }, SyntaxError);
      should.throws(() => { Eggvm.run('if(true, 3, 4, 5)'); }, SyntaxError);
    });
  });

  describe('[def|define|:=](word, value)', () => {
    it('should throw if trying to acces an undefined word', () => {
      should.throws(() => { Eggvm.run('do(x)'); }, ReferenceError);
    });

    it('should return the value of the defined word', () => {
      Eggvm.run('do(define(x, 3), x)').should.be.eql(3);
    });

    it('should treat \'def\', \'define\', and \':=\' as synonyms', () => {
      Eggvm.run('do(def(x, 3), x)').should.be.eql(3);
      Eggvm.run('do(define(x, 3), x)').should.be.eql(3);
      Eggvm.run('do(:=(x, 3), x)').should.be.eql(3);
    });
  });

  describe('fun(args, body)', () => {
    it('should be able to call user defined functions', () => {
      Eggvm.run('do(def(plusOne, fun(x, +(x, 1))), plusOne(10))').should.be.eql(11);
    });

    it('should only allow argument names to be words', () => {
      should.throws(() => { Eggvm.run('fun(3, +(3, 1))'); }, SyntaxError);
    });

    it('should detect that the number of arguments passed is correct', () => {
      should.throws(() => { Eggvm.run('do(def(f, fun(x, +(x, 3))), f(3, 4))'); }, TypeError);
    });

    it('should allow to define a function without arguments', () => {
      Eggvm.run('do(def(mf, fun(3)), mf())').should.be.eql(3);
    });
  });

  describe('set(name, value)', () => {
    it('should be able to set values of variables in outer scopes', () => {
      Eggvm.run('do(def(os, 3), def(mf, fun(set(os, 4))), mf(), os)').should.be.eql(4);
    });

    it('should change only the variable on the inner scope', () => {
      Eggvm.run(`do(
                def(var, 3),
                def(m1f, fun(
                            do(
                              def(var, 3),
                              set(var, 4)
                              )
                            )
                   ),
                m1f(),
                var
                )`).should.be.eql(3);
    });
  });
});


describe('Test TopEnv', () => {
  describe('boolean values', () => {
    it('should Eggvm.luate true to true, and false to false', () => {
      Eggvm.run('do(true)').should.be.true();
      Eggvm.run('do(false)').should.be.false();
    });
  });

  describe('basic operators', () => {
    it('should Eggvm.luate arithmetic operators', () => {
      // Add
      Eggvm.run('do(+(-2.5, 5))').should.be.eql(2.5);

      // Sub
      Eggvm.run('do(-(-2, 5.8))').should.be.eql(-7.8);

      // Mul
      Eggvm.run('do(*(-2, 5))').should.be.eql(-10);

      // Div (result is float)
      Eggvm.run('do(/(5, 2))').should.be.eql(2.5);
    });

    it('should Eggvm.luate boolean operators', () => {
      // Equal / Not Equal for nums
      Eggvm.run('do(==(5.4, 5.4))').should.be.true();
      Eggvm.run('do(!=(5.4, 5.4))').should.be.false();
      Eggvm.run('do(==(5, 2))').should.be.false();
      Eggvm.run('do(!=(5, 2))').should.be.true();

      // Equal / Not Equal for strings
      Eggvm.run('do(==("hello", "hello"))').should.be.true();
      Eggvm.run('do(!=("hello", "hello"))').should.be.false();
      Eggvm.run('do(==("hello", "bye"))').should.be.false();
      Eggvm.run('do(!=("hello", "bye"))').should.be.true();
    });
  });

  describe('array operators', () => {
    it('should be able to define arrays', () => {
      Eggvm.run('array(1, 2, 3)').should.be.eql([1, 2, 3]);
    });

    it('should be able to get the size of an array', () => {
      Eggvm.run('length(arr(1, 3, 5, 7))').should.be.eql(4);
    });

    it('should be able to get a value with an array index', () => {
      Eggvm.run('[](arr(1, 3, 5, 7), 0)').should.be.eql(1);
      Eggvm.run('<-(arr(1, 3, 5, 7), 1)').should.be.eql(3); // Alias
      Eggvm.run('element(arr(1, 3, 5, 7), 2)').should.be.eql(5); // Alias

      // Negative indices
      Eggvm.run('element(arr(1, 3, 5, 7), -2)').should.be.eql(5);

      // Can't access index out of bounds
      should.throws(() => { Eggvm.run('<-(arr(1, 2, 3), 50)'); }, RangeError);
    });
  });
});
