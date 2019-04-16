const should = require("should")

const {Evaluator} = require("../lib/eggvm.js");

describe("Test SpecialForms", () => {
  const ev = new Evaluator();

  describe("do(...)", () => {
    it("should return the argument evaluated", () => {
      ev.run("do(3)").should.be.eql(3);
      ev.run("do(\"hola\")").should.be.eql("hola");
    });

    it("should return the result of the evaluated expression", () => {
      ev.run("do(if(true, 3, 4))").should.be.eql(3);
    });
  });

  describe("if(cond, v1, v2)", () => {
    it("should return the first argument if evaluates to true", () => {
      ev.run("if(true, 3, 4)").should.be.eql(3);
    });

    it("should return the second argument if evaluates to false", () => {
      ev.run("if(false, 3, 4)").should.be.eql(4);
    });

    it("should throw SyntaxError if not passing exactly 3 arguments", () => {
      should.throws(() => { ev.run("if(true, 3)"); }, SyntaxError);
      should.throws(() => { ev.run("if(true, 3, 4, 5)"); }, SyntaxError);
    });
  });

  describe("[def|define](word, value)", () => {
    it("should throw if trying to acces an undefined word", () => {
      should.throws(() => { ev.run("do(x)"); }, ReferenceError);
    });

    it("should return the value of the defined word", () => {
      ev.run("do(define(x, 3), x)").should.be.eql(3);
    });

    it("should treat 'def' and 'define' as synonyms", () => {
      ev.run("do(def(x, 3), x)").should.be.eql(3);
    });
  });
});
