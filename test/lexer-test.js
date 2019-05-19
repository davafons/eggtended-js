const fs = require("fs");
require("should");
const sinon = require("sinon");

const { Lexer } = require("../lib/parser/lexer.js");

describe("Testing Lexer class behaviour", () => {
  const lexer = new Lexer();

  before(() => {
    const readFileSyncStub = sinon.stub(fs, "readFileSync");

    const program = "do(print(3))";
    readFileSyncStub.withArgs("testfile", "utf-8").returns(program);
  });

  after(() => {
    fs.readFileSync.restore();
  });

  it("should be able to tokenize a line and count the LP-RP balance", () => {
    // Perfectly balanced, as all things should be
    let parBalance = lexer.getParBalance("foo()");
    parBalance.should.be.exactly(0);

    parBalance = lexer.getParBalance("foo.bar()");
    parBalance.should.be.exactly(0);

    parBalance = lexer.getParBalance("hue[");
    parBalance.should.be.exactly(1);

    parBalance = lexer.getParBalance("];");
    parBalance.should.be.exactly(-1);
  });

  it("should tokenize from a file", () => {
    const tokens = Lexer.tokenizeFromFile("testfile");
    console.log(tokens);
  });
});
