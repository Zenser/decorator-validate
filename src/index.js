import innerValidate from './validate'
import {getRules} from './helpers'
export {default as validators, registValidator} from './validator'
export * from './decorators'
export function validate(...args) {
    let target = args[0]
    if (args.length > 1) {
        return innerValidate(...args)
    } else {
        return innerValidate(getRules(target), target)
    }
}
export {getRules}
