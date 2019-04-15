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
});

describe("Test program 'examples/one.egg'", () => {
  it("should be parsed correctly", () => {
    const raw_data = fs.readFileSync('examples/one.evm');
    const expected_evm = JSON.parse(raw_data);

    parser.parseFromFile("examples/one.egg").should.be.eql(expected_evm);
  });
});

