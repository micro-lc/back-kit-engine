import {factory} from '../factory'
import Register from '../Register'

describe('Register tests', () => {
  it('should create an instance of factory register', () => {
    const register = new Register()

    expect(register.get().size).toEqual(0)
  })

  it('should add a factory to a register', () => {
    const register = new Register()
    const event = factory('event')
    register.add(event)
    expect(register.size()).toEqual(1)
    expect(register.contains(event.label)).toBe(true)
    expect(register.contains(event)).toBe(true)
    expect(register.contains('unregistered')).toBe(false)

    expect(register.getMap()).toHaveProperty('event')
  })
})
