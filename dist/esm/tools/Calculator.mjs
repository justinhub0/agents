import { Tool } from '@langchain/core/tools';
import * as math from 'mathjs';

class Calculator extends Tool {
    static lc_name() {
        return 'Calculator';
    }
    get lc_namespace() {
        return [...super.lc_namespace, 'calculator'];
    }
    name = 'calculator';
    async _call(input) {
        try {
            return math.evaluate(input).toString();
        }
        catch {
            return 'I don\'t know how to do that.';
        }
    }
    description = 'Useful for getting the result of a math expression. The input to this tool should be a valid mathematical expression that could be executed by a simple calculator.';
}

export { Calculator };
//# sourceMappingURL=Calculator.mjs.map
