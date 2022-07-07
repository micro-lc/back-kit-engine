export type LinkQueryParams = Record<string, any>

export type LinkTarget = '_blank' | '_self' | '_parent' | '_top' | string

export type ClickPayload = {
  /** Link reference, either relative starting with '/' or absolute */
  href?: string

  /** Where to open the href. Defaults to _self */
  target?: LinkTarget

  /** Query params appended to href */
  query?: LinkQueryParams
}

export type FormLinkOptions = ClickPayload & {
  /** FontAwesome icon name */
  icon?: string
}
