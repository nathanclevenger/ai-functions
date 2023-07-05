import {NodeVM,VM} from 'vm2'

export const javascriptEval = (code) => {
  const vm = new VM({
    allowAsync: true,
    timeout: 1000,
    sandbox: { fetch }
  })
  return vm.run(code)
}