![Eggtended Logo](https://i.imgur.com/9N4qe98.png)

An extended version of the **Egg** programming language from the _"Eloquent Javascript"_ book.

|                                                          Build                                                          |   Version |                                                                          Coverage                                                                             |                                                                                                                     Quality                                                                                                                     |                                                              Documentation                                                               |                                                                 License                                                                  |
| :---------------------------------------------------------------------------------------------------------------------: | :-------:|:--------------------------------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------------------: |
| [![Build Status](https://travis-ci.org/davafons/eggtended-js.svg?branch=master)](https://travis-ci.org/davafons/eggtended-js) |[![npm version](https://badge.fury.io/js/eggtended-js.svg)](https://badge.fury.io/js/eggtended-js)| [![Coverage Status](https://coveralls.io/repos/github/Dibad/eggtended-js/badge.svg?branch=master)](https://coveralls.io/github/Dibad/eggtended-js?branch=master) | [![Codacy Badge](https://api.codacy.com/project/badge/Grade/60277e744287497ebf0433a7c004b650)](https://www.codacy.com/app/Dibad/eggtended-js?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Dibad/eggtended-js&amp;utm_campaign=Badge_Grade) | [![Document Badge](https://doc.esdoc.org/github.com/Dibad/eggtended-js/badge.svg)](https://doc.esdoc.org/github.com/Dibad/eggtended-js/) | [![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0) |

## Code examples

### For loops
```ruby
for(define(x, 0), <(x, 5), ++(x),
  print(x)
) # Prints "1 2 3 4 5"
```
### Arrays and Foreach loops
```ruby
def(x, arr(1, 2, 3)),
foreach(x, x, print(x)) # Prints "1 2 3"
```

### Maps
```ruby
def(y, map(a: 1, b: 2, c: 3)),
foreach(key, y.keys(), print(key.toUpperCase())), # Prints "A B C"
```

### Everything is an object
```ruby
print(4.toFixed(2)),  # Prints "4.00"
```

### OOP
```ruby
def(x, object (
  "c", 0,
  "gc", ->{this.c},
  "sc", ->{value, =(this, "c", value)},
  "inc", ->{=(this, "c", +(this.c, 1))}
)),
/* print(x), */
print(x.gc),   # 0
x.sc(4),
print(x.gc),   # 4
x.inc,
print(x.gc),   # 5
```

### Try-Catch blocks
```ruby
try(
  do {  # Try
    throw(42)
  },
  do {  # Catch
    print(+("Caught error! ", __error__))
  }
),
```

### Regex
```ruby
:=(d, r/
       (?<year>  \d{4} ) -?  # year
       (?<month> \d{2} ) -?  # month
       (?<day>   \d{2} )     # day
      /x),
print(d.test("1987-07-14")),  # true
```

### Module import/export
```ruby
do {
  set(module, "exports", object(
    "three", 3,
  )),
  set(module, "exports", "consolelog", fun(x, print(x)))
}
```
```ruby
do {
  :=(mod, require("examples/module.egg")),
  mod.consolelog(5),           # Prints "5"
  mod.consolelog(mod.three)    # Prints "3"
}
```

## AST Generation

From this program:
```ruby
do(
  print(true.toString())
)
```
The following AST is generated:
```text
{
  "type": "apply",
  "operator": {
    "type": "word",
    "name": "do"
  },
  "args": [
    {
      "type": "apply",
      "operator": {
        "type": "word",
        "name": "print"
      },
      "args": [
        {
          "type": "apply",
          "operator": {
            "type": "word",
            "name": "true"
          },
          "args": [
            {
              "type": "value",
              "value": "toString"
            }
          ]
        }
      ]
    }
  ]
}
```

This AST is the __interpreter's input__ for executing a program.

## Author

**David Afonso Dorta** - [University of La Laguna](https://www.ull.es/grados/ingenieria-informatica/). Computer Engineering, 3rd year
