const valipipe = (() => {
    const validators = {};

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
        if (!validators[name]) {
            validator.prototype = validators;
            validator.pipeable = pipeable;
            validator.modifying = modifying;
            validator.wrapping = wrapping;
            validators[name] = validator;
        }
    }

    function exec(stack, value, i = 0) {
        if (i == stack.length) return true;
        let check = stack[i];
        
        if (check.modifying) {
            return exec(stack, [check(...value)], i + 1);
        } else if (check.wrapping) {
            return check(exec(stack, value, i + 1));
        } else if (check(...value)) {
            return exec(stack, value, i + 1);
        } else {
            return false;
        }
    }

    function Proxify(method, _stack = []) {
        return new Proxy(method, {
            get(target, prop) {
                if (validators.hasOwnProperty(prop)) {
                    let validator = validators[prop];
                    if (!validator.pipeable) {
                        throw new Error(`Validator ${prop} is not pipeable`);
                    }
                    _stack.push(target);
                    return Proxify(validator, _stack);
                } else {
                    return target[prop];
                }
            },
            set() { },
            apply(target, thisValue, args) {
                if (target.wrapping) throw new Error('Validator should not be called without pipe');
                if (args.length < target.length) {
                    let func = (...a) => target(...args, ...a);
                    return Proxify(func, _stack);
                } else {
                    _stack.push(target);
                    return exec(_stack, args);
                }
            }
        });
    }

    const valipipe = new Proxy({ registerValidator }, {
        get(target, prop) {
            if (validators.hasOwnProperty(prop)) {
                return Proxify(validators[prop]);
            } else {
                return target[prop];
            }
        },
        set() {
            throw new Error('Please use valipipe.registerValidator');
        }
    });


    valipipe.registerValidator('string', (s) => typeof s === 'string');
    valipipe.registerValidator('email', (s) => valipipe.string(s) && /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(s));

    valipipe.registerValidator('number', (n) => typeof n === 'number');
    valipipe.registerValidator('int', (n) => n % 1 === 0);
    valipipe.registerValidator('eq', (a, b) => a === b);
    valipipe.registerValidator('lt', (a, v) => v < a);
    valipipe.registerValidator('gt', (a, v) => v > a);
    valipipe.registerValidator('btw', (a, b, v) => valipipe.gt(a, b) && valipipe.lt(b, v));
    
    valipipe.registerValidator('array', (a) => Array.isArray(a));
    valipipe.registerValidator('any', (a) => valipipe.array(a) && a.filter(i => i).length === 0);
    valipipe.registerValidator('all', (a) => valipipe.array(a) && a.filter(i => i).length === a.length);
    
    valipipe.registerValidator('len', (v) => v.length, { modifying: true });
    valipipe.registerValidator('not', (v) => !v, { wrapping: true });
    
    
    if (module && module.exports) module.exports = valipipe;
    return valipipe;
})();