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

  describe('[def|define](word, value)', () => {
    it('should throw if trying to acces an undefined word', () => {
      should.throws(() => { ev.run('do(x)'); }, ReferenceError);
    });

    it('should return the value of the defined word', () => {
      ev.run('do(define(x, 3), x)').should.be.eql(3);
    });

    it('should treat \'def\' and \'define\' as synonyms', () => {
      ev.run('do(def(x, 3), x)').should.be.eql(3);
    });
  });

  describe('fun(args, body)', () => {
    it('should be able to call user defined functions', () => {
      ev.run('do(def(plusOne, fun(x, +(x, 1))), plusOne(10))').should.be.eql(11);
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
});
