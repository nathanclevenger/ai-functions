import { createMachine, createActor } from 'xstate'

// Stateless machine definition
// machine.transition(...) is a pure function used by the interpreter.
const toggleMachine = createMachine({
  id: 'Switch',
  initial: 'inactive',
  states: {
    inactive: { on: { Toggle: 'active' } },
    active: { on: { Toggle: 'inactive' } },
  },
})

// Machine instance with internal state
const toggleService = createActor(toggleMachine).start()
toggleService.subscribe((state) => console.log(state.value))
// => 'inactive'

toggleService.send({ type: 'Toggle' })
// => 'active'

toggleService.send({ type: 'Toggle' })
// => 'inactive'
