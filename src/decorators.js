import validator from './validator'

export const decorators = {}

;['required'].concat(Object.keys(validator)).forEach(key => {
    let rule = {}
    key === 'required' ? rule.required = true : rule.fn = validator[key]
    decorators[key] = createDecorator(rule)
})

const defaultRule = {
    message: 'valid fail',
    fn: () => true
}
export function createDecorator(_rule = defaultRule) {
    return function (args) {
        let rule = Object.create(_rule)
        if (typeof args === 'string') {
            rule.message = args || 'valid fail'
        } else {
            Object.assign(rule, args)
        }
        
        return (target, property, descriptor) => {
            if (!target.__rules) {
                Object.defineProperty(target, '__rules', {
                    enumerable: false,
                    configurable: false,
                    writable: false,
                    value: Object.create(null)
                })
            }
            if (target.__rules[property]) {
                target.__rules[property].push(rule)
            } else {
                target.__rules[property] = [rule]
            }
        }
    }
}

