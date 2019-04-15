const tokenRegex = require("../lib/tokenRegex.js");
const fs = require('fs');
const should = require("should")

const parse = require("../lib/parse.js");
const parser = new parse.Parser();

describe("Test program 'examples/one.egg'", () => {
  it("should be parsed correctly", () => {
    const raw_data = fs.readFileSync('examples/one.evm');
    const expected_evm = JSON.parse(raw_data);

    parser.parseFromFile("examples/one.egg").should.be.eql(expected_evm);

    // TODO: Define test
  });
});

