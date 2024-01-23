import {LitElement} from 'lit'
import {property} from 'lit/decorators.js'
import {Subscription,ReplaySubject} from 'rxjs'
import type {Observable} from 'rxjs'

import type {EventBus} from '../../events'
import {Labels, Locale, LocalizedComponent, localizeObj, mergeLocales} from '../localized-components'

export type Listener = (eventBus: EventBus, kickoff: Observable<0>) => Subscription
export type Bootstrapper = (eventBus: EventBus) => void

function registerListeners<T extends BkBase> (
  this: T,
  eventBus: EventBus,
  subscription: Subscription,
  currentBusSubscriptions: Subscription[],
  context: Listener[],
  kickoff: Observable<0>
): void {
  if (!subscription.closed) {
    context.forEach((listener) => {
      const newSubscription = listener.call(this, eventBus, kickoff)
      currentBusSubscriptions.push(newSubscription)
      subscription.add(newSubscription)
    })
  }
}

function bootstrap<T extends BkBase> (
  this: T, eventBus: EventBus, context: Bootstrapper[]
): void {
  context.forEach((bootstrap) => { bootstrap.call(this, eventBus) })
}

/**
 * @superclass
 * @description BackOffice library base superclass for Lit-based webcomponents
 */
export class BkBase<L extends Labels = Labels> extends LitElement implements LocalizedComponent<L> {
  /**
   * @description a window that might support sandboxed logic/methods
   */
  @property({attribute: false}) proxyWindow = window

  /**
   * @description [micro-lc-element-composer](https://microlc.io/documentation/docs/micro-lc/core_plugins#microlc-element-composer)
   * default prop representing the authenticated user. It's context can be configured via micro-lc backend config files.
   * @see {@link https://microlc.io/documentation/docs/micro-lc/authentication}
   */
  @property({attribute: false}) currentUser: Record<string, unknown> = {}

  /**
   * @description [micro-lc-element-composer](https://microlc.io/documentation/docs/micro-lc/core_plugins#microlc-element-composer)
   * default prop representing the `eventBus` default channel unless overridden by `busDiscriminator` prop.
   */
  @property({attribute: false})
  get eventBus (): EventBus | undefined {
    return this._eventBus
  }

  /**
   * When an eventBus is set:
   * 1. check if there are subscriptions and if any pop them while removing the tead down logic
   * 2. if the eventBus is defined register all listeners with the subscription
   * 3. if the eventBus is defined then bootstrap
   * 4. set the eventBus
   */
  set eventBus (e: EventBus | undefined) {
    const len = this._currentBusSubscriptions.length
    for (let i = 0; i < len; i++) {
      const tearDown = this._currentBusSubscriptions.pop() as Subscription
      this._subscription.remove(tearDown)
      tearDown.unsubscribe()
    }

    if (e) {
      registerListeners.call(this, e, this._subscription, this._currentBusSubscriptions, this._listeners, this._timeout$.asObservable())
      bootstrap.call(this, e, this._bootstrap)
    }
    this._eventBus = e
  }

  defaultLocale?: Locale<L> | undefined
  @property({attribute: false})
  set customLocale(l: Locale<L>) {
    this._locale = localizeObj(mergeLocales(l, this.defaultLocale))
  }
  
  private _currentBusSubscriptions: Subscription[] = []

  private _eventBus?: EventBus

  private _listeners: Listener[]

  private _bootstrap: Bootstrapper[]

  private _subscription: Subscription = new Subscription()

  protected _timeout$ = new ReplaySubject<0>()

  protected get subscription () {
    return this._subscription
  }

  /**
   * When new subscription is set:
   * 1. unsubscribe all previous subscriptions
   * 2. clean the array of current subscription
   * 3. if an eventBus is present, register all listeners updating newly injected subscription and current subscription array
   * 4. set subscription
   */
  protected set subscription (s: Subscription) {
    this._subscription.unsubscribe()
    this._currentBusSubscriptions = []

    if (this._eventBus) {
      registerListeners.call(this, this._eventBus, s, this._currentBusSubscriptions, this._listeners, this._timeout$.asObservable())
    }

    this._subscription = s
  }

  _locale?: L
  set locale (l: L | undefined) {
    this._locale = l
  }
  get locale (): L | undefined {
    return this._locale ?? localizeObj(this.defaultLocale)
  }

  constructor (
    listeners?: Listener | Listener[],
    bootstrap?: Bootstrapper | Bootstrapper[]
  ) {
    super()

    if (listeners) {
      this._listeners = Array.isArray(listeners) ? listeners : [listeners]
    } else {
      this._listeners = []
    }

    if (bootstrap) {
      this._bootstrap = Array.isArray(bootstrap) ? bootstrap : [bootstrap]
    } else {
      this._bootstrap = []
    }
  }

  connectedCallback (): void {
    super.connectedCallback()

    if (this.subscription.closed) {
      this.subscription = new Subscription()
      this._currentBusSubscriptions = []
    }

    this._timeout$.next(0)
  }

  disconnectedCallback (): void {
    this._subscription.unsubscribe()
    this._currentBusSubscriptions = []
    this._timeout$ = new ReplaySubject()
    super.disconnectedCallback()
  }
}
