const tokenRegex = require("../lib/tokenRegex.js");
const should = require("should")

describe("Regex for LP token", () => {
  it("should recognize ( as valid a token", () => {
    const expected = { type: "LP", value: "(", start: 1, end: 1, line: 1 };
    tokenRegex.LP.reset().exec("(").should.be.eql(expected);
  });

  it("should treat { as a synonym for (", () => {
    const expected = { type: "LP", value: "{", start: 1, end: 1, line: 1 };
    tokenRegex.LP.reset().exec("{").should.be.eql(expected);
  });

  it("should treat [ as a synonym for (", () => {
    const expected = { type: "LP", value: "[", start: 1, end: 1, line: 1 };
    tokenRegex.LP.reset().exec("[").should.be.eql(expected);
  });
});

describe("Regex for RP token", () => {
  it("should recognize ) as valid a token", () => {
    const expected = { type: "RP", value: ")", start: 1, end: 1, line: 1 };
    tokenRegex.RP.reset().exec(")").should.be.eql(expected);
  });

  it("should treat } as a synonym for )", () => {
    const expected = { type: "RP", value: "}", start: 1, end: 1, line: 1 };
    tokenRegex.RP.reset().exec("}").should.be.eql(expected);
  });

  it("should treat ] as a synonym for )", () => {
    const expected = { type: "RP", value: "]", start: 1, end: 1, line: 1 };
    tokenRegex.RP.reset().exec("]").should.be.eql(expected);
  });
});
