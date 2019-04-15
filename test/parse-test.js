const tokenRegex = require("../lib/tokenRegex.js");
const fs = require('fs');
const should = require("should")

const parse = require("../lib/parse.js");
const parser = new parse.Parser();


describe("Test for simple cases", () => {
  it("should parse a simple, one-line empty program", () => {
    const expected = { type: 'apply',
        operator: { type: 'word', name: 'do' },
        args: [] }

    parser.parse("do()").should.be.eql(expected);
  });

  it("should parse a simple, one-line program with arguments", () => {
    const expected = { type: 'apply',
        operator: { type: 'word', name: 'do' },
        args: [ { type: 'word', name: 'a' } ] }

    parser.parse("do(a)").should.be.eql(expected);
  });

  it("should be able to parse chained applies", () => {
    const expected = { type: 'apply',
      operator:
      { type: 'apply',
        operator: { type: 'word', name: 'do' },
        args: [ { type: 'word', name: 'a' } ] },
      args: [ { type: 'word', name: 'b' } ] }

    parser.parse("do(a)(b)").should.be.eql(expected);
  });

  it("should throw SyntaxError if there is more input after parsing", () => {
    should.throws(() => { parser.parse("do(a)b") }, SyntaxError);
  });

  it("should throw SyntaxError if there is , or ) missing", () => {
    should.throws(() => { parser.parse("do(a b)") }, SyntaxError);
    should.throws(() => { parser.parse("do(a, b") }, SyntaxError);
  });
});

describe("Test program 'examples/one.egg'", () => {
  it("should be parsed correctly", () => {
    const raw_data = fs.readFileSync('examples/one.egg.evm');
    const expected_evm = JSON.parse(raw_data);

    parser.parseFromFile("examples/one.egg").should.be.eql(expected_evm);
  });
});

describe("Test program 'examples/scope.egg'", () => {
  it("should be parsed correctly", () => {
    const raw_data = fs.readFileSync('examples/scope.egg.evm');
    const expected_evm = JSON.parse(raw_data);

    parser.parseFromFile("examples/scope.egg").should.be.eql(expected_evm);
  });
});

describe("Test program 'examples/string.egg'", () => {
  it("should be parsed correctly", () => {
    const raw_data = fs.readFileSync('examples/string.egg.evm');
    const expected_evm = JSON.parse(raw_data);

    parser.parseFromFile("examples/string.egg").should.be.eql(expected_evm);
  });
});

describe("Test program 'examples/sum.egg'", () => {
  it("should be parsed correctly", () => {
    const raw_data = fs.readFileSync('examples/sum.egg.evm');
    const expected_evm = JSON.parse(raw_data);

    parser.parseFromFile("examples/sum.egg").should.be.eql(expected_evm);
  });
});
