import style from 'antd/dist/antd.min.css'
import Button from 'antd/es/button'
import AntdForm, {FormProps as AntdFormProps} from 'antd/es/form'
import AntdModal, {ModalProps as AntdModalProps} from 'antd/es/modal'
import {html} from 'lit'
import {customElement, property, query, state} from 'lit/decorators.js'
import React from 'react'
import {filter} from 'rxjs'

import {BkBase} from '../src/base/bk-base'
import {BkComponent} from '../src/base/bk-component'
import type {EventBus} from '../src/events'

type ModalProps = AntdModalProps
type FormProps = AntdFormProps

function Modal ({children, ...props}: ModalProps): JSX.Element {
  return React.createElement(AntdModal, props, children)
}

function Form ({children, ...props}: FormProps): JSX.Element {
  const Submit = React.createElement(AntdForm.Item, {
    wrapperCol: {offset: 8, span: 16}
  }, React.createElement(Button, {type: 'primary', htmlType: 'submit'}, 'Submit'))

  return React.createElement(AntdForm, {
    name: 'basic',
    labelCol: {span: 8},
    wrapperCol: {span: 16},
    initialValues: {remember: true},
    onFinish: () => {},
    onFinishFailed: () => {},
    autoComplete: 'off',
    ...props
  }, Submit, React.isValidElement(children))
}

function closeModal(this: CustomModal): void {
  this._visible = false
}

function createModalProps (this: CustomModal): ModalProps {
  const close = closeModal.bind(this)
  return {
    title: 'Basic Modal',
    visible: this._visible,
    onCancel: close,
    onOk: close,
    getContainer: () => this.container.firstElementChild as HTMLDivElement,
    children: React.createElement('slot')
  }
}

function open(this: CustomModal, e: EventBus) {
  return e.pipe(filter(({label}) => label === 'open-modal'))
    .subscribe(() => {
      this._visible = true
    })
}

@customElement('custom-modal')
export class CustomModal extends BkComponent<ModalProps> {
  @query('#modal-container') container!: HTMLDivElement

  @state() protected _visible?: boolean

  @property({type: Boolean})
  set visible(e: boolean | undefined) {
    this._visible = e
  }
  get visible(): boolean | undefined {
    return this._visible
  }

  @property({attribute: false}) onopen?: () => void

  constructor() {
    super(
      Modal,
      createModalProps,
      open
    )

    this.stylesheet = style
  }

  protected updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties)
    changedProperties.has('_visible') && this._visible && this.onopen?.()
  }

  protected render(): unknown {
    return html`<div id="modal-container"><div></div></div>`
  }
}

@customElement('custom-form')
export class CustomForm extends BkComponent<FormProps> {
  @property({attribute: false}) onsubmit: ((this: GlobalEventHandlers, ev?: SubmitEvent) => any) | null = null

  constructor() {
    super(Form, () => ({onFinish: () => this.onsubmit?.()}))

    this.stylesheet = style
  }
}

@customElement('custom-form-modal')
export class CustomFormModal extends BkBase {
  @state() visible = false

  protected render(): unknown {
    return html`
      <custom-modal
        .eventBus=${this.eventBus}
        .visible=${this.visible}
        .onopen=${() => {this.visible = true}}
      >
        <custom-form
          .eventBus=${this.eventBus}
          .onsubmit=${() => {this.visible = false}}
        ></custom-form>
      </custom-modal>
    `
  }
}
