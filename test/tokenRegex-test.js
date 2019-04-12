const tokenRegex = require("../lib/tokenRegex.js");

describe("Regex for LP token", () => {
  it("should get parenthesis as a token", () => {
    const expected = { type: "LP", value: "(", start: 1, end: 1, line: 1 };
    tokenRegex.LP.exec("(").should.be.eql(expected);
  });

  it("should treat { as a synonym for (", () => {
    const expected = { type: "LP", value: "{", start: 1, end: 1, line: 1 };
    tokenRegex.LP.exec("{").should.be.eql(expected);
  });

  it("should treat [ as a synonym for (", () => {
    const expected = { type: "LP", value: "[", start: 1, end: 1, line: 1 };
    tokenRegex.LP.exec("[").should.be.eql(expected);
  });
});
