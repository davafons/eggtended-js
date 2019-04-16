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

  it("should evaluate sum(...)", () => {

  });
});
