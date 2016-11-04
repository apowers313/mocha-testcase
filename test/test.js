var TestCase = require ("../mocha-testcase.js");
var assert = require ("chai").assert;

class Testy extends TestCase {
    constructor() {
        super(assert, it);

        this.testFunction = function(arg1, arg2) {
            if (typeof arg1 !== "string") {
                throw new TypeError ("bad arg1");
            }

            if (typeof arg2 !== "object") {
                throw new TypeError ("bad arg2");
            }
            return 1;
        };
        this.testObject = {
            arg1: "test",
            arg2: {foo: "bar"}
        };
        this.argOrder = [
            "arg1",
            "arg2"
        ];
        this.ctx = this;

        this.validateRet = function(ret) {
            if (ret === 1) return true;
            return false;
        };
    }
}

describe("basic tests", function() {
    new Testy().test();
    new Testy().test("default test");
    new Testy("arg1", null).testBadArgs("simple modify");
    new Testy({path: "arg2", value: null}).testBadArgs("modify object");
    new Testy([{path: "arg1", value: null},
               {path: "arg2", value: null}
        ]).testBadArgs("multiple modify");
    it ("doIt and validateRet without error", function(done) {
        var x = new Testy()
        x.doIt()
            .then((ret) => {
                assert (x.validateRet (ret), "return value should validate");
                done();
            })
            .catch ((err) => {
                console.log (err);
                assert (false, "doIt should not error:" + err);
                throw err;
            });
        });

});