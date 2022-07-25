import {fixture, html, waitUntil, fixtureCleanup, expect} from '@open-wc/testing'
import {ReplaySubject} from 'rxjs'

import type {CustomForm, CustomFormModal, CustomModal} from '../../pages/custom-form-modal'
import type {EventBus} from '../../src/events'

import '../../pages/custom-form-modal'

describe('modal with slotted child tests', () => {
  afterEach(() => {
    fixtureCleanup()
  })

  it('should render a form within a modal', async () => {
    const _ = new ReplaySubject() as EventBus

    const formModal = await fixture(html`
      <custom-form-modal .eventBus=${_}></custom-form-modal>
    `) as CustomFormModal

    _.next({label: 'open-modal', payload: {}})

    await waitUntil(() => formModal.visible, 'modal should be visible')

    expect(formModal).shadowDom.equal(`
      <custom-modal>
        <custom-form>
        </custom-form>
      </custom-modal>
    `)

    const customForm = formModal.shadowRoot?.querySelector('custom-form') as CustomForm
    const customModal = formModal.shadowRoot?.querySelector('custom-modal') as CustomModal
    const slot = customModal.shadowRoot?.querySelector('slot')
    expect(slot?.assignedNodes()).to.be.an('array').that.does.include(customForm)

    customForm.shadowRoot?.querySelector('button')?.click()
    await waitUntil(() => !formModal.visible, 'modal should be turned off')
  })
})
