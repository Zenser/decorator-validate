/*!
* decorator-validate.js v0.1.0
* (c) 2018 张帅
* Released under the MIT License.
*/
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global['decorator-validate'] = {})));
}(this, (function (exports) { 'use strict';

    function getRules(val) {
        if (val && val.__rules) {
            var rules = Object.assign({}, val.__rules);
            Object.keys(val).forEach(function (k) {
                rules[k] = getRules(val[k]) || rules[k];
            });
            return rules;
        }
    }

    var CN_MOBIIE_REGEXP = /^(\+?0?86-?)?1[3456789]\d{9}$/;
    var FIXED_TEL_REGEXP = /^(0[0-9]{2,3}-)?([1-9][0-9]{6,7})+(-[0-9]{1,4})?$/;

    function cnmobile(value) {
        return CN_MOBIIE_REGEXP.test(value);
    }

    function cnname(value) {
        return (/^[*\u4E00-\u9FA5]{1,8}(?:[·•]{1}[\u4E00-\u9FA5]{2,10})*$/.test(value)
        );
    }

    function fixedtel(value) {
        return FIXED_TEL_REGEXP.test(value);
    }
    // added verfication of bankcard http://blog.csdn.net/mytianhe/article/details/18256925
    function bankcard(cardNo) {
        cardNo = ('' + cardNo).replace(/\s/gi, '');
        var len = cardNo.length;
        if (!/\d+/.test(cardNo) || len < 9) {
            return false;
        }
        cardNo = cardNo.split('');
        var checkCode = parseInt(cardNo[len - 1]);
        var sum = 0;
        for (var i = len - 2, j = 0; i >= 0; i--, j++) {
            var it = parseInt(cardNo[i]);
            if (j % 2 === 0) {
                it *= 2;
                it = parseInt(it / 10) + parseInt(it % 10);
            }
            sum += parseInt(it);
        }

        if ((sum + checkCode) % 10 === 0) {
            return true;
        } else {
            return false;
        }
    }

    function idCard(val) {
        if (/^\d{17}[0-9xX]$/.test(val)) {
            var vs = '1,0,x,9,8,7,6,5,4,3,2'.split(',');
            var ps = '7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2'.split(',');
            var ss = val.toLowerCase().split('');
            var r = 0;
            for (var i = 0; i < 17; i++) {
                r += ps[i] * ss[i];
            }
            return vs[r % 11] === ss[17];
        }
    }

    function limit(val, source) {
        var min = source.min,
            max = source.max;

        var compareValue = typeof val === 'string' ? val && val.length : val;
        if (min !== undefined && compareValue < min) {
            return false;
        }
        if (max !== undefined && compareValue > max) {
            return false;
        }
        return true;
    }

    var validator = {
        cnmobile: cnmobile,
        cnname: cnname,
        fixedtel: fixedtel,
        bankcard: bankcard,
        idCard: idCard,
        limit: limit
    };

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

    function validate(rules, values) {
        if (Array.isArray(rules) && rules.length) {
            // exec in sequence
            return rules.slice(1).reduce(function (lastPromise, curentRule) {
                return lastPromise.then(function () {
                    return validItem(curentRule, values);
                });
            }, validItem(rules[0], values));
        } else if ((typeof rules === 'undefined' ? 'undefined' : _typeof(rules)) === 'object' && rules !== null) {
            return new Promise(function (resolve, reject) {
                var keys = Object.keys(rules),
                    errors = [],
                    finalLen = 0,
                    length = keys.length;
                keys.forEach(function (key) {
                    validate(rules[key], values[key]).then(judge).catch(function (error) {
                        errors.push(error);
                        judge();
                    });
                });

                function judge() {
                    if (++finalLen === length) {
                        // finally
                        if (errors.length) {
                            reject(errors);
                        } else {
                            resolve();
                        }
                    }
                }
            });
        } else {
            return Promise.resolve();
        }
    }

    function validItem(rule, value) {
        var result = void 0;
        var source = Object.assign({ value: value }, rule);
        if (rule.required && (value == null || value === '' || Array.isArray(value) && !value.length)) {
            result = false;
        } else if (!rule.fn) {
            result = true;
        } else if (typeof rule.fn === 'string') {
            // has defined validate
            var validateKey = rule.fn;
            if (validateKey in validator) {
                result = validator[validateKey](value, source);
            } else {
                throw new Error('not define ' + validateKey + ' in validator');
            }
        } else {
            // funciton validate
            result = rule.fn(value, source);
        }
        if (typeof result.then === 'function') {
            return result;
        }
        return result ? Promise.resolve() : Promise.reject(source);
    }

    var decorators = {};['required'].concat(Object.keys(validator)).forEach(function (key) {
        var rule = {};
        key === 'required' ? rule.required = true : rule.fn = validator[key];
        decorators[key] = createDecorator(rule);
    });

    var defaultRule = {
        message: 'valid fail',
        fn: function fn() {
            return true;
        }
    };
    function createDecorator() {
        var rule = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultRule;

        return function (args) {
            if (typeof args === 'string') {
                rule.message = args || 'valid fail';
            } else {
                Object.assign(rule, args);
            }

            return function (target, property, descriptor) {
                if (!target.__rules) {
                    Object.defineProperty(target, '__rules', {
                        enumerable: false,
                        configurable: false,
                        writable: false,
                        value: Object.create(null)
                    });
                    Object.defineProperty(target, '$validate', {
                        enumerable: false,
                        configurable: false,
                        writable: false,
                        value: function value() {
                            return validate(getRules(target), target);
                        }
                    });
                }
                if (target.__rules[property]) {
                    target.__rules[property].push(rule);
                } else {
                    target.__rules[property] = [rule];
                }
            };
        };
    }

    function validate$1() {
        var target = arguments.length <= 0 ? undefined : arguments[0];
        if (arguments.length > 1) {
            return validate.apply(undefined, arguments);
        } else {
            console.log(getRules(target));

            return validate(getRules(target), target);
        }
    }

    exports.validate = validate$1;
    exports.decorators = decorators;
    exports.createDecorator = createDecorator;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
