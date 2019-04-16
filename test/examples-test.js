const fs = require('fs');
const should = require('should');
const sinon = require('sinon');

const {Parser} = require('../lib/parse.js');
const {Eggvm} = require('../lib/eggvm.js');
const parser = new Parser();
const eggvm = new Eggvm();

describe('Testing programs from \'examples/\' folder', () => {
  beforeEach(() => {
    this.logSpy = sinon.spy(console, 'log');
  });

  afterEach(() => {
    this.logSpy.restore();
  });

  describe('Test \'examples/one.egg\'', () => {

    it('should be parsed correctly', () => {
      const rawData = fs.readFileSync('examples/one.egg.evm');
      const expected = JSON.parse(rawData);

      parser.parseFromFile('examples/one.egg').should.be.eql(expected);
    });

    it('should return the expected output after executing', () => {
      const expected = 50;
      eggvm.runFromEVM('examples/one.egg.evm').should.be.eql(expected);
      this.logSpy.calledWith(expected).should.be.true();
    });
  });

  describe('Test \'examples/two.egg\'', () => {

    it('should be parsed correctly', () => {
      const rawData = fs.readFileSync('examples/two.egg.evm');
      const expected = JSON.parse(rawData);

      parser.parseFromFile('examples/two.egg').should.be.eql(expected);
    });

    it('should return the expected output after executing', () => {
      const expected = 9;
      eggvm.runFromEVM('examples/two.egg.evm').should.be.eql(expected);
      this.logSpy.calledWith(expected).should.be.true();
    });
  });

  describe('Test \'examples/scope.egg\'', () => {
    it('should be parsed correctly', () => {
      const rawData = fs.readFileSync('examples/scope.egg.evm');
      const expected = JSON.parse(rawData);

      parser.parseFromFile('examples/scope.egg').should.be.eql(expected);
    });

    it('should return the expected output after executing', () => {
      eggvm.runFromEVM('examples/scope.egg.evm');
      this.logSpy.calledWith(9).should.be.true();
      this.logSpy.calledWith(8).should.be.true();
    });
  });

  describe('Test \'examples/scope-err.egg\'', () => {
    it('should be parsed correctly', () => {
      const rawData = fs.readFileSync('examples/scope-err.egg.evm');
      const expected = JSON.parse(rawData);

      parser.parseFromFile('examples/scope-err.egg').should.be.eql(expected);
    });

    it('should return the expected output after executing', () => {
      should.throws( () => { eggvm.runFromEVM('examples/scope-err.egg.evm')}, ReferenceError );
    });
  });

  describe('Test \'examples/string.egg\'', () => {
    it('should be parsed correctly', () => {
      const rawData = fs.readFileSync('examples/string.egg.evm');
      const expected = JSON.parse(rawData);

      parser.parseFromFile('examples/string.egg').should.be.eql(expected);
    });

    it('should return the expected output after executing', () => {
      eggvm.runFromEVM('examples/string.egg.evm');
      this.logSpy.calledWith('s').should.be.true();
    });
  });

  describe('Test \'examples/sum.egg\'', () => {
    it('should be parsed correctly', () => {
      const rawData = fs.readFileSync('examples/sum.egg.evm');
      const expected = JSON.parse(rawData);

      parser.parseFromFile('examples/sum.egg').should.be.eql(expected);
    });

    it('should return the expected output after executing', () => {
      const expected = 395.5;
      eggvm.runFromEVM('examples/sum.egg.evm').should.be.eql(expected);
      this.logSpy.calledWith(expected).should.be.true();
    });
  });

  describe('Test \'examples/array.egg\'', () => {
    it('should be parsed correctly', () => {
      const rawData = fs.readFileSync('examples/array.egg.evm');
      const expected = JSON.parse(rawData);

      parser.parseFromFile('examples/array.egg').should.be.eql(expected);
    });

    it('should return the expected output after executing', () => {
      eggvm.runFromEVM('examples/array.egg.evm');
      this.logSpy.calledWith([ 1, 4 ]).should.be.true();
      this.logSpy.calledWith(5).should.be.true();
    });
  });

  describe('Test \'examples/reto.egg\'', () => {
    it('should be parsed correctly', () => {
      const rawData = fs.readFileSync('examples/reto.egg.evm');
      const expected = JSON.parse(rawData);

      parser.parseFromFile('examples/reto.egg').should.be.eql(expected);
    });

    it('should return the expected output after executing', () => {
      eggvm.runFromEVM('examples/reto.egg.evm');
      this.logSpy.calledWith('sum(array[1, 2, 3]) := 6').should.be.true();
    });
  });
});
