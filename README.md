## About
This is a small helper library to make [Mocha](https://mochajs.org/) testing easier. It provides a TestCase class, which you use as a base class for defining your own tests. The TestCase class has a bunch of convenience arguments for doing things like calling a function with known-good arguments, easily modifying default arguments, or calling a function with bad arguments and making sure it fails.

Note that this library assumes the use of JavaScript ES2015 (aka - ES6).

## Installing

node.js:
`npm install mocha-testcase`

browser:
``` html
<script type="text/javascript" src="https://cdn.rawgit.com/apowers313/mocha-testcase/master/mocha-testcase.js"></script>
```

## TestCase Configuration
The following are the properties of the TestClass class that your class will need to override (see the example below).

### testFunction
The function that will be tested.

### testObject
The arguments to the function to be tested, as an object. For example:

``` javascript
testObject = {
    arg1: "value",
    argTwo: 3.14159,
    arg3: { foo: "bar" }
};
```

### argOrder

The order to pass the arguments in `testObject` to `testFunction`, as an array of strings. For example:

``` javascript
argOrder = {
    "arg1",
    "argTwo",
    "arg3"
};
```

### ctx
When calling `testFunction`, `ctx` will be the `this` object.

## TestCase Methods
### test(desc)
Run a single instance of `testFunc` with `testObject` as the argument(s) and expects it to pass.
* **desc** - a human description of what the test does

### testBadArgs(desc)
Run a single instance of `testFunc` with `testObject` as the argument(s) and expects the test to fail by throwing a `TypeError`.
* **desc** - a human description of what the test does

### doIt()
Run a single instance of `testFunc` with `testObject` as the argument(s). No assertions or testing performed.

### fuzz(count) (coming soon!)
Run `count` number of fuzzing tests, using [js-fuzzing](https://github.com/apowers313/js-fuzzing) to generate or mutate `testObject`
* **count** - the number of fuzzing tests to perform

### modify(...args)
See the Modifying Default Arguments section below for a description.

## Modifying Default Arguments
The `testObject` that will be used as the argument to `testFunction` can be modified by calling the `modify` method. Note that any arguments to the `constructor` can be passed through to `modify` to make the constructor an easy modifier.

Passing arguments to the constructor is the same as passing arguments to modify. Modify is similar to lodash's set() method, and will create properties if they do not already exist.

``` javascript
// testObject defined in the constructor (see below)
testObject = { name: "Adam",
               address: {
                   street: "123 Main St",
                   city: "San Jose",
                   zipcode: 94123
               },
               children: [
                   {name: "Jack", age: 4},
                   {name: "Jill", age: 6}
               ]}

// default modify method of TestCase
modify ("name", "Sara"); // changes "name" from "Adam" to "Sara"
modify ("address.street", "599 S Bascom Ave"); // changes "123 Main St" to "599 S Bascom Ave"
modify ([
        {path: "address.city", value: "Milpitas"}
        {path: "address.zipcode", value: 95035}
        ]) // changes "San Jose" to "Milpitas" and zipcode from 94123 to 95035
// entire object
// insert property
// change one array
// add to array
```

There are three ways to modify the default arguments object.

Type 1: path and value as two arguments
``` javascript
modify ("path.to.property", value)
```
Most convenient usage, especially for lots of tests to small changes in default arguments.

Type 2: path and value in an object
``` javascript
modify ({path: "path.to.property", value: value})
```
Especially useful where `value` is `undefined`, which has the effect of deleting properties.

Type 3: an array of path / value objects
``` javascript
modify ([{path: "path.to.property", value: value}
         {path: "path.to.other.thing", value: value2 }
        ])
```
Especially useful for modifying lots of default values.

## Example: Defining Your Test

Below is an example of defining a test class for the [browser's IndexedDB interface](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API), specifically the `open` method of that interface:

``` javascript
class IndexedDbOpenTest extends TestCase {
    constructor() {
        // call the TestCase constructor
        super();

        // the function to be tested
        this.testFunction = window.indexedDB.open;

        // the default arguments for the function
        this.testObject = {name: "testdb", version: "1"};

        // the order of the arguments for the test function
        this.argOrder = ["name", "version"];

        // the context to use for the test function
        this.ctx = window.indexedDB;

        // enable the constructor to modify the default testObject
        if (arguments.length) this.modify(...arguments);
    }
}
```

## Example: Using Your Test

``` javascript
// passes with default arguments
new IndexedDbOpenTest().test();

// constructor modifies default arguments so that "name" is null, and version is still 1
// test passes since `window.indexedDB.open()` will throw a `TypeError`
new IndexedDbOpenTest("name", null).testBadArgs("Database open: name cannot be null");

// constructor modifies default arguments so that "name" is still "testdb", and version is 0
// test passes since `window.indexedDB.open()` will throw a `TypeError`
new IndexedDbOpenTest("version", 0).testBadArgs("Database open: version cannot be zero");

// delete all default args to pass no arguments
// test passes since `window.indexedDB.open()` will throw a `TypeError`
new IndexedDbOpenTest({[
        {path: "name", value: undefined},
        {path: "version", value: undefined}
        ]}).testBadArgs("Database open: requires at least one argument");
```