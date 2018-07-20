import {getRules} from './helpers'
import innerValidate from './validate'
export * from './decorators'
export function validate(...args) {
    let target = args[0]
    if (args.length > 1) {
        return innerValidate(...args)
    } else {
        return innerValidate(getRules(target), target)
    }
}
