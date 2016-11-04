/**
 * TestCase
 *
 * A generic template for test cases
 * Is intended to be overloaded with subclasses that override testObject, testFunction and argOrder
 * The testObject is the default arguments for the testFunction
 * The default testObject can be modified with the modify() method, making it easy to create new tests based on the default
 * The testFunction is the target of the test and is called by the doIt() method. doIt() applies the testObject as arguments via toArgs()
 * toArgs() uses argOrder to make sure the resulting array is in the right order of the arguments for the testFunction
 */
class TestCase {
    constructor(a, i) {
        this.assert = a||assert;
        this.it = i||it;

        this.testFunction = function() {
            throw new Error("Test Function not implemented");
        };
        this.testObject = {};
        this.argOrder = [];
        this.ctx = null;
    }

    /**
     * toObject
     *
     * return a copy of the testObject
     */
    toObject() {
        return JSON.parse(JSON.stringify(this.testObject)); // cheap clone
    }

    /**
     * toArgs
     *
     * converts test object to an array that is ordered in the same way as the arguments to the test function
     */
    toArgs() {
        var ret = [];
        // XXX, TODO: this won't necessarily produce the args in the right order
        for (let idx of this.argOrder) {
            ret.push(this.testObject[idx]);
        }
        return ret;
    }

    /**
     * modify
     *
     * update the internal object by a path / value combination
     * e.g. :
     * modify ("foo.bar", 3)
     * accepts three types of args:
     *    "foo.bar", 3
     *    {path: "foo.bar", value: 3}
     *    [{path: "foo.bar", value: 3}, ...]
     */
    modify(arg1, arg2) {
        var mods;

        // check for the two argument scenario
        if (typeof arg1 === "string" && arg2 !== undefined) {
            mods = {
                path: arg1,
                value: arg2
            };
        } else {
            mods = arg1;
        }

        // accept a single modification object instead of an array
        if (!Array.isArray(mods) && typeof mods === "object") {
            mods = [mods];
        }

        // iterate through each of the desired modifications, and call recursiveSetObject on them
        for (let idx in mods) {
            var mod = mods[idx];
            let paths = mod.path.split(".");
            recursiveSetObject(this.testObject, paths, mod.value);
        }

        // iterates through nested `obj` using the `pathArray`, creating the path if it doesn't exist
        // when the final leaf of the path is found, it is assigned the specified value
        function recursiveSetObject(obj, pathArray, value) {
            var currPath = pathArray.shift();
            if (typeof obj[currPath] !== "object") {
                obj[currPath] = {};
            }
            if (pathArray.length > 0) {
                return recursiveSetObject(obj[currPath], pathArray, value);
            }
            obj[currPath] = value;
        }

        return this;
    }

    /**
     * doIt
     *
     * run the test function with the top-level properties of the test object applied as arguments
     */
    doIt() {
        return new Promise ((resolve) => {
            resolve (this.testFunction.call(this.ctx, ...this.toArgs()));
        });
    }

    /**
     * doIt
     *
     * run the test function with the top-level properties of the test object applied as arguments, and validate the results
     */
    test(testDesc="untitled test") {
        this.it(testDesc, () => {
            return this.doIt()
                // .then(() => {
                //     return new ScopedCredentialInfo().init();
                // })
                .then((ret) => {
                    // check the result
                    this.assert (this.validateRet(ret), "return value");
                });
        });
    }

    validateRet() {
        throw new Error ("Not implemented");
    }

    /**
     * testArgs
     *
     * calls doIt() with testObject() and expects it to fail with a TypeError()
     */
    testBadArgs(testDesc="untitled test") {
        this.it(testDesc, () => {
            this.doIt().then(function() {
                this.assert(false, "should fail due to bad arguments");
                done();
            })
            .catch(function(err) {
                if (!(err instanceof TypeError)) {
                    this.assert (false, "expected TypeError:", err);
                }
            });
        });
    }
}

if (module) {
    module.exports = TestCase;
}