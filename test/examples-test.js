const fs = require('fs');
const should = require('should');

const {Parser} = require('../lib/parse.js');
const {Eggvm} = require('../lib/eggvm.js');
const parser = new Parser();
const eggvm = new Eggvm();

describe('Test program \'examples/one.egg\'', () => {
  it('should be parsed correctly', () => {
    const rawData = fs.readFileSync('examples/one.egg.evm');
    const expected = JSON.parse(rawData);

    parser.parseFromFile('examples/one.egg').should.be.eql(expected);
  });

  it('should return the correct output after executing', () => {

  });
});

describe('Test program \'examples/scope.egg\'', () => {
  it('should be parsed correctly', () => {
    const rawData = fs.readFileSync('examples/scope.egg.evm');
    const expected = JSON.parse(rawData);

    parser.parseFromFile('examples/scope.egg').should.be.eql(expected);
  });
});

describe('Test program \'examples/string.egg\'', () => {
  it('should be parsed correctly', () => {
    const rawData = fs.readFileSync('examples/string.egg.evm');
    const expected = JSON.parse(rawData);

    parser.parseFromFile('examples/string.egg').should.be.eql(expected);
  });
});

describe('Test program \'examples/sum.egg\'', () => {
  it('should be parsed correctly', () => {
    const rawData = fs.readFileSync('examples/sum.egg.evm');
    const expected = JSON.parse(rawData);

    parser.parseFromFile('examples/sum.egg').should.be.eql(expected);
  });
});
