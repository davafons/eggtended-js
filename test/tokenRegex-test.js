const tokenRegex = require("../lib/tokenRegex.js");
const should = require("should")

describe("Regex for LP token", () => {
  it("should recognize ( as valid a token", () => {
    const expected = { type: "LP", value: "(", start: 1, end: 1};
    tokenRegex.LP.reset().exec("(").should.be.eql(expected);
  });

  it("should treat { as a synonym for (", () => {
    const expected = { type: "LP", value: "{", start: 1, end: 1};
    tokenRegex.LP.reset().exec("{").should.be.eql(expected);
  });

  it("should treat [ as a synonym for (", () => {
    const expected = { type: "LP", value: "[", start: 1, end: 1};
    tokenRegex.LP.reset().exec("[").should.be.eql(expected);
  });
});

describe("Regex for RP token", () => {
  it("should recognize ) as valid a token", () => {
    const expected = { type: "RP", value: ")", start: 1, end: 1};
    tokenRegex.RP.reset().exec(")").should.be.eql(expected);
  });

  it("should treat } as a synonym for )", () => {
    const expected = { type: "RP", value: "}", start: 1, end: 1};
    tokenRegex.RP.reset().exec("}").should.be.eql(expected);
  });

  it("should treat ] as a synonym for )", () => {
    const expected = { type: "RP", value: "]", start: 1, end: 1};
    tokenRegex.RP.reset().exec("]").should.be.eql(expected);
  });
});

describe("Regex for STRING token", () => {
  it("should recognize anything between \" \" as valid a token", () => {
    const expected = { type: "STRING", value: "hello world", start: 3, end: 13};
    tokenRegex.STRING.reset().exec("\"hello world\"").should.be.eql(expected);
  });

  it ("shouldn't recognize strings without \" \". Those are words", () => {
    should.not.exists(tokenRegex.STRING.reset().exec("hello world"))
  });
});

describe("Regex for WORD token", () => {
  it("should match any name identifier combining characters, numbers and symbols", () => {
    const expected = { type: "WORD", value: "MY_!D3n7if@er", start: 1, end: 13};
    tokenRegex.WORD.reset().exec("MY_!D3n7if@er").should.be.eql(expected);
  });

  it ("shouldn't include special characters on the identifier, like ()[]{},", () => {
    const expected = { type: "WORD", value: "fun", start: 1, end: 3};
    tokenRegex.WORD.reset().exec("fun()").should.be.eql(expected);
    tokenRegex.WORD.reset().exec("fun[]").should.be.eql(expected);
    tokenRegex.WORD.reset().exec("fun{}").should.be.eql(expected);
    tokenRegex.WORD.reset().exec("fun, ").should.be.eql(expected);
  });
});
