const should = require('should');

const {Eggvm} = require('../lib/eggvm.js');

describe('Test SpecialForms', () => {
  const ev = new Eggvm();

  describe('do(...)', () => {
    it('should return the argument evaluated', () => {
      ev.run('do(3)').should.be.eql(3);
      ev.run('do("hola")').should.be.eql('hola');
    });

    it('should return the result of the evaluated expression', () => {
      ev.run('do(if(true, 3, 4))').should.be.eql(3);
    });
  });

  describe('if(cond, v1, v2)', () => {
    it('should return the first argument if evaluates to true', () => {
      ev.run('if(true, 3, 4)').should.be.eql(3);
    });

    it('should return the second argument if evaluates to false', () => {
      ev.run('if(false, 3, 4)').should.be.eql(4);
    });

    it('should throw SyntaxError if not passing exactly 3 arguments', () => {
      should.throws(() => { ev.run('if(true, 3)'); }, SyntaxError);
      should.throws(() => { ev.run('if(true, 3, 4, 5)'); }, SyntaxError);
    });
  });

  describe('[def|define|:=](word, value)', () => {
    it('should throw if trying to acces an undefined word', () => {
      should.throws(() => { ev.run('do(x)'); }, ReferenceError);
    });

    it('should return the value of the defined word', () => {
      ev.run('do(define(x, 3), x)').should.be.eql(3);
    });

    it('should treat \'def\', \'define\', and \':=\' as synonyms', () => {
      ev.run('do(def(x, 3), x)').should.be.eql(3);
      ev.run('do(define(x, 3), x)').should.be.eql(3);
      ev.run('do(:=(x, 3), x)').should.be.eql(3);
    });
  });

  describe('fun(args, body)', () => {
    it('should be able to call user defined functions', () => {
      ev.run('do(def(plusOne, fun(x, +(x, 1))), plusOne(10))').should.be.eql(11);
    });

    it('should only allow argument names to be words', () => {
      should.throws(() => { ev.run('fun(3, +(3, 1))'); }, SyntaxError);
    });

    it('should detect that the number of arguments passed is correct', () => {
      should.throws(() => { ev.run('do(def(f, fun(x, +(x, 3))), f(3, 4))'); }, TypeError);
    });

    it('should allow to define a function without arguments', () => {
      ev.run('do(def(mf, fun(3)), mf())').should.be.eql(3);
    });
  });

  describe('set(name, value)', () => {
    it('should be able to set values of variables in outer scopes', () => {
      ev.run('do(def(os, 3), def(mf, fun(set(os, 4))), mf(), os)').should.be.eql(4);
    });

    it('should change only the variable on the inner scope', () => {
      ev.run(`do(
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
  const ev = new Eggvm();

  describe('boolean values', () => {
    it('should evaluate true to true, and false to false', () => {
      ev.run('do(true)').should.be.true();
      ev.run('do(false)').should.be.false();
    });
  });

  describe('operators', () => {
    it('should evaluate arithmetic operators', () => {
      // Add
      ev.run('do(+(-2.5, 5))').should.be.eql(2.5);

      // Sub
      ev.run('do(-(-2, 5.8))').should.be.eql(-7.8);

      // Mul
      ev.run('do(*(-2, 5))').should.be.eql(-10);

      // Div (result is float)
      ev.run('do(/(5, 2))').should.be.eql(2.5);
    });

    it('should evaluate boolean operators', () => {
      // Equal / Not Equal for nums
      ev.run('do(==(5.4, 5.4))').should.be.true();
      ev.run('do(!=(5.4, 5.4))').should.be.false();
      ev.run('do(==(5, 2))').should.be.false();
      ev.run('do(!=(5, 2))').should.be.true();

      // Equal / Not Equal for strings
      ev.run('do(==("hello", "hello"))').should.be.true();
      ev.run('do(!=("hello", "hello"))').should.be.false();
      ev.run('do(==("hello", "bye"))').should.be.false();
      ev.run('do(!=("hello", "bye"))').should.be.true();
    });
  });

  describe('array and length', () => {
    it('should be able to define arrays', () => {
      ev.run('array(1, 2, 3)').should.be.eql([1, 2, 3]);
    });

    it('should be able to recognize the size of an array', () => {
      ev.run('length(arr(1, 3, 5, 7))').should.be.eql(4);
    });
  });
});
