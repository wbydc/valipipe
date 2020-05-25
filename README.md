# valipipe

Validate your variables with pipes

## Features

Create your own validate functions and combine them to pipes

## Instalation

```bash
npm install valipipe
```

## How to use

```javascript
const valipipe = require('valipipe');
// or add script to your page

let a = [2, 3];
// check if a is array and it's length less than 5
console.log( valipipe.array.len.lt(5)( a ) ); // => true

let b = 4;
// check if b is number and it's value between 2 and 6 and it is not equal to 3 and is integer
console.log( valipipe.number.not.eq(3).btw(2,6).int( b ) ); // => true

// register new validator named 'password' and checking if value is string and it's length more than 8
valipipe.registerValidator('password', (v) => valipipe.string(v) && valipipe.len.gt(8)(v));

// register new validator that can't be used in pipes
valipipe.registerValidator('stanalonevalidator', (v) => ...v, { pipeable: false });

// register new validator that modifies the checked value (like valipipe.len)
valipipe.registerValidator('modifyingvalidator', (v) => ...v, { modifying: true });

// register new validator that wraps next validator (like valipipe.not)
valipipe.registerValidator('wrappingvalidator', (v) => ...v, { wrapping: true });
```

Full `valipipe.registerValidator` description:
```javascript
/**
 * Register new validator
 * 
 * @param {string} name validator name
 * @param {function} validator validator function
 * @param {Object} options options
 */
function registerValidator(name, validator, {
    // can validator be used in pipes
    pipeable = true,
    // will validator modify value
    modifying = false,
    // will validator wrap another validator
    wrapping = false,
} = {}) {
    // code
}
```