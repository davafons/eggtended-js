const fs = require('fs');
const should = require('should');
const sinon = require('sinon');

const {Parser} = require('../lib/parse.js');
const {Eggvm} = require('../lib/eggvm.js');
const parser = new Parser();

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
            Eggvm.runFromEVM(fileEVM);
            assertOutput(outputs);
          });

        } else {
          it(`should throw an exception of type ${outputs.name}`, () => {
            should.throws(() => {Eggvm.runFromEVM(fileEVM);}, outputs);
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
  tests.set('examples/boolean.egg', ['true']);

  tests.set('examples/string.egg', ['s']);
  tests.set('examples/sum.egg', [395.5]);
  tests.set('examples/reto.egg', ['sum(array[1, 2, 3]) := 6']);

  tests.set('examples/array.egg', [[1, 4], 5]);
  tests.set('examples/array-index.egg', [1, [2, 3], 3, 3, 2]);
  tests.set('examples/array-properties.egg', [1, [5, 3], 3]);

  tests.set('examples/set-error.egg', TypeError);
  tests.set('examples/set-error2.egg', TypeError);

  tests.set('examples/method3.egg', ['A-B-C']);
  tests.set('examples/method-concatenation.egg', ['1-hello egg']);
  tests.set('examples/property.egg', [2, 3]);

  tests.set('examples/string-apply.egg', [5, '4.00', 19]);
  tests.set('examples/operators-arithm.egg', [6, 5, 10, -5, 0, -10]);

  tests.set('examples/map.egg',
    [
      new Map([['x', 4], ['y', new Map([['z', 3]])]]),
      4,
      new Map([['z', 3]]),
      3,
      new Map([['z', 50]])
    ]);

  tests.set('examples/map-colon.egg',
    [
      new Map([['x', 4], ['y', new Map([['z', 3]])]]),
      4,
      new Map([['z', 3]]),
      3,
      new Map([['z', 50]])
    ]);

  tests.set('examples/multi-sub-set.egg',
    [
      1,
      new Map([['x', 2], ['y', [3, 4]]]),
      [3, 4],
      new Map([['x', 2], ['y', 5]]),
      [0, 1]
    ]);

  tests.set('examples/map-sub.egg', [1, new Map([['d', 5], ['e', 3]]), 3]);
  tests.set('examples/fun-inside-map.egg', [7, 4]);

  tests.set('examples/missing.egg', [9]);
  tests.set('examples/missing-err.egg', SyntaxError);
  tests.set('examples/objects.egg', [0, 4, 5]);
  tests.set('examples/regex.egg', [true, 0, '2015', '02']);

  tests.set('examples/dot.egg', ['1-4-5', 5]);
  tests.set('examples/dot-obj-2.egg', [0, 0, 0, 5, 5, 5]);
  tests.set('examples/dot-num.egg', ['4.00', '4.00', '4.00']);

  tests.set('examples/for.egg', [0, 1, 2, 3, 4]);
  tests.set('examples/foreach.egg', [1, 2, 3, 'A', 'B', 'C']);

  tests.set('examples/client.egg', ['inside module', 5, 5, 3]);

  // Execute all the defined tests
  executeTests(tests);
});
