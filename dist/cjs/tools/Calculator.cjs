'use strict';

var tools = require('@langchain/core/tools');
var math = require('mathjs');

function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n.default = e;
    return Object.freeze(n);
}

var math__namespace = /*#__PURE__*/_interopNamespaceDefault(math);

class Calculator extends tools.Tool {
    static lc_name() {
        return 'Calculator';
    }
    get lc_namespace() {
        return [...super.lc_namespace, 'calculator'];
    }
    name = 'calculator';
    async _call(input) {
        try {
            return math__namespace.evaluate(input).toString();
        }
        catch {
            return 'I don\'t know how to do that.';
        }
    }
    description = 'Useful for getting the result of a math expression. The input to this tool should be a valid mathematical expression that could be executed by a simple calculator.';
}

exports.Calculator = Calculator;
//# sourceMappingURL=Calculator.cjs.map
