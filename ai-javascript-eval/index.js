import {NodeVM,VM} from 'vm2'

export const javascriptEval = (code) => {
  //securely use vm2
  const vm = new NodeVM({
    allowAsync: true,
    timeout: 1000,
    sandbox: { fetch }
  })
  return vm.run(code)
}