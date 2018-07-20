export function getRules(val) {
    if (val && val.__rules) {
        let rules = Object.assign({}, val.__rules)
        Object.keys(val).forEach(k => {
            rules[k] = getRules(val[k]) || rules[k]
        })
        return rules
    }
}