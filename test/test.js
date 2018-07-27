import {
    decorators,
    createDecorator,
    validate,
    getRules,
    validators
} from '../src'

const {
    required,
    cnname,
    cnmobile,
    idCard,
    limit
} = decorators

describe('校验测试', () => {
    it('base test', () => {
        const asyncValid = createDecorator({
            fn(value, source) {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        reject(source)
                    }, 2000)
                })
            }
        })
        let form = {
            @cnname('chinese name format is incorrect')
            @required('please input your name')
            name: '',
            contact: {
                @asyncValid('your phone has exist')
                @cnmobile('chinese phone format is incorrect')
                @required('please input your phone')
                phone: '',
                @limit({
                    min: 4,
                    max: 20,
                    message: 'limit in 4 to 20'
                })
                address: ''
            }
        }

        validate(form).catch(error => {
            console.log(error)
        })
    })

    it('dynamic test', () => {
        let form = {
            @cnname('请输入合法的真实姓名')
            name: '',
            @idCard('请输入合法的身份证号')
            idCard: '',
            @required('请选择您的学历')
            education: '',
            @required('请选择您的婚姻状况')
            maritalStatus: '',
            @required('请选择您的职业')
            job: ''
        }
        next()
        next2()

        function next() {
            if (!validators.cnname(form.name)) {
                console.error('请输入合法的真实姓名')
                return
            }
            if (!validators.idCard(form.idCard)) {
                console.error('请输入合法的身份证号')
                return
            }
            if (!form.education) {
                console.error('请选择您的学历')
                return
            }
            if (!form.maritalStatus) {
                console.error('请选择您的婚姻状况')
                return
            }
            if (!form.job) {
                console.error('请选择您的职业')
                return
            }
            // do next ...
        }

        function next2() {
            let rule = getRules(form)
            if (true) {
                delete rule.name
                delete rule.idCard
            }
            validate(rule, form).catch(error => {
                console.error(error[0])
            })
            // do next
        }
    })
})
