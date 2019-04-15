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

describe("Regex for NUMBER token", () => {
  it("should match integers, with and without sign", () => {

    // Normal int
    let expected = { type: "NUMBER", value: "323", start: 1, end: 3};
    tokenRegex.NUMBER.reset().exec("323").should.be.eql(expected);

    // With positive sign
    expected = { type: "NUMBER", value: "+2", start: 1, end: 2};
    tokenRegex.NUMBER.reset().exec("+2").should.be.eql(expected);

    // With negative sign
    expected = { type: "NUMBER", value: "-123", start: 1, end: 4};
    tokenRegex.NUMBER.reset().exec("-123").should.be.eql(expected);

    // Signs can't go alone!!
    should.not.exists(tokenRegex.NUMBER.reset().exec("-"));
    should.not.exists(tokenRegex.NUMBER.reset().exec("+"));
  });

  it("should match for floats, floating point and exponential notation", () => {

    // Normal float
    let expected = { type: "NUMBER", value: "12.34", start: 1, end: 5};
    tokenRegex.NUMBER.reset().exec("12.34").should.be.eql(expected);

    // Float starting with .
    expected = { type: "NUMBER", value: ".35", start: 1, end: 3};
    tokenRegex.NUMBER.reset().exec(".35").should.be.eql(expected);

    // Float in exponential notation
    expected = { type: "NUMBER", value: "2e5", start: 1, end: 3};
    tokenRegex.NUMBER.reset().exec("2e5").should.be.eql(expected);

    // Float with decimals and exponential notation
    expected = { type: "NUMBER", value: "45.8e5", start: 1, end: 6};
    tokenRegex.NUMBER.reset().exec("45.8e5").should.be.eql(expected);

    // Float with exponential notation with sign and E
    expected = { type: "NUMBER", value: "8E-34", start: 1, end: 5};
    tokenRegex.NUMBER.reset().exec("8E-34").should.be.eql(expected);

    // Shouldn't match exponential alone or without exponential num
    should.not.exists(tokenRegex.NUMBER.reset().exec("e45"));
    should.not.exists(tokenRegex.NUMBER.reset().exec("E"));
  });

});

