// rollup.config.js
const babel = require('rollup-plugin-babel')
const fs = require('fs')
const config = JSON.parse(fs.readFileSync('./package.json'))

module.exports = {
    input: 'src/index.js',
    output: {
        file: 'dist/decorator-validate.js',
        name: 'decorator-validate',
        format: 'umd',
        banner: `/*!
* decorator-validate.js v${config.version}
* (c) 2018 张帅
* Released under the MIT License.
*/`
    },
    context: __dirname,
    plugins: [
        babel({
            exclude: 'node_modules/**' // 只编译我们的源代码
        })
    ]
}
