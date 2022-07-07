import {randomUUID} from 'crypto'

import {factory} from '../factory'

describe('factory tests', () => {
  it('should spawn a new kind of event', () => {
    const label = randomUUID()
    const event = factory(label)

    expect(event).toHaveProperty('is')
    expect(event.is({label, payload: {}})).toBe(true)
    expect(event.is({label: '', payload: {}})).toBe(false)
    expect(event).toHaveProperty('label', label)
    expect(typeof event).toBe('function')
  })

  it('should spawn a new kind of event with scope', () => {
    const label = randomUUID()
    const scope = randomUUID()
    const event = factory(label, {scope})

    expect(event.label).toBe(`${scope}/${label}`)
  })

  it('should spawn a new kind of event with scope and custom divider', () => {
    const label = randomUUID()
    const scope = randomUUID()
    const event = factory(label, {scope, divider: '#'})

    expect(event.label).toBe(`${scope}#${label}`)
  })

  it('should spawn a new kind of event with alias', () => {
    const label = randomUUID()
    const alias = randomUUID()
    const event = factory(label, {aliases: alias})

    expect(event.label).toBe(label)
    expect(event.is({label: alias, payload: {}})).toBe(true)
  })

  it('should spawn a new kind of event with aliases', () => {
    const label = randomUUID()
    const alias = randomUUID()
    const event = factory(label, {aliases: [alias]})

    expect(event.label).toBe(label)
    expect(event.is({label: alias, payload: {}})).toBe(true)
  })
})
