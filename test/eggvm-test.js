const should = require("should")

const {Evaluator} = require("../lib/eggvm.js");

describe("Test SpecialForms", () => {
  let ev;

  beforeEach(() => {
    ev = new Evaluator();
  });


  it("should evaluate do(...)", () => {
    ev.run("do(3)").should.be.eql(3);

    ev.run("do(\"hola\")").should.be.eql("hola");
  });

  it("should evaluate if(exp, r1, r2)", () => {
    ev.run("if(true, 3, 4)").should.be.eql(3);
    ev.run("if(false, 3, 4)").should.be.eql(4);
  });
});
