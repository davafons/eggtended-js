const fs = require('fs');
const should = require('should');
const sinon = require('sinon');

const {Parser} = require('../lib/parse.js');
const {Eggvm} = require('../lib/eggvm.js');
const parser = new Parser();
const eggvm = new Eggvm();

describe('Testing programs from \'examples/\' folder', () => {

  // Spy calls to 'console.log'
  beforeEach(() => {
    this.logSpy = sinon.spy(console, 'log');
  });

  afterEach(() => {
    this.logSpy.restore();
  });

  // Method to test the number and values of 'logSpy' calls
  const assertOutput = (outs) => {
    this.logSpy.callCount.should.be.eql(outs.length);
    outs.forEach((output, index) => {
      this.logSpy.getCall(index).calledWithExactly(output).should.be.true();
    });
  };

  // Method for creating and executing the dynamic tests
  const executeTests = (tests) => {
    tests.forEach((outputs, file) => {

      // Path to the related .evm file
      const fileEVM = file + '.evm';

      describe(`Test for ${file}`, () => {

        // -- TEST PARSING --
        it('should be parsed correctly', () => {
          const rawData = fs.readFileSync(fileEVM);
          const expectedTree = JSON.parse(rawData);

          parser.parseFromFile(file).should.be.eql(expectedTree);
        });


        // -- TEST EXECUTION --
        if(Array.isArray(outputs)) {
          it('should print the expected output after execution', () => {
            eggvm.runFromEVM(fileEVM);
            assertOutput(outputs);
          });

        } else {
          it(`should throw an exception of type ${outputs.name}`, () => {
            should.throws(() => {eggvm.runFromEVM(fileEVM)}, outputs);
          });
        }

      });
    });
  };

  // Define tests
  const tests = new Map();

  tests.set('examples/one.egg', [50]);
  tests.set('examples/two.egg', [9]);
  tests.set('examples/scope.egg', [9, 8]);
  tests.set('examples/scope-err.egg', ReferenceError);
  tests.set('examples/string.egg', ['s']);
  tests.set('examples/sum.egg', [395.5]);
  tests.set('examples/array.egg', [[1, 4], 5]);
  tests.set('examples/reto.egg', ['sum(array[1, 2, 3]) := 6']);
  tests.set('examples/array-index.egg', [1, [2, 3], 3, 3, 2]);
  tests.set('examples/array-properties.egg', [1, [5, 3], 3]);
  tests.set('examples/set-error.egg', TypeError);
  tests.set('examples/method3.egg', ['A-B-C']);
  tests.set('examples/method-concatenation.egg', ['1-hello egg']);
  tests.set('examples/property.egg', [2, 3]);
  tests.set('examples/string-apply.egg', [5, '4.00', 19]);

  // Execute all the defined tests
  executeTests(tests);
});
