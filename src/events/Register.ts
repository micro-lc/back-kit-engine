import type {Labelled} from './factory'

export default class Register<T extends Labelled = Labelled> {
  private factories: Set<T>

  constructor () {
    this.factories = new Set<T>()
  }

  contains (t: string | Labelled): boolean {
    let isContained = false
    for (const f of this.factories) {
      if (f.label === (typeof t === 'string' ? t : t.label)) {
        isContained = true
        break
      }
    }

    return isContained
  }

  add<S extends T> (factory: S): number {
    if (!this.contains(factory)) {
      this.factories.add(factory)
    }

    return this.factories.size
  }

  size (): number {
    return this.factories.size
  }

  get (): Set<T> {
    return this.factories
  }

  getMap (): Record<string, T> {
    const map: Record<string, T> = {}
    this.factories.forEach((f) => {
      map[f.label] = f
    })
    return map
  }
}
