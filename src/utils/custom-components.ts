import Handlebars from 'handlebars'

Handlebars.registerHelper('rawObject', (context) => {
  return JSON.stringify(context)
})
const handlebarsCompileOptions = {
  noEscape: true
}

/**
 * helps interpolating a custom webcomponent property
 * with the context in which is embedded.
 * Taking properties and writing their values as handlebars it is possible
 * to access the context `args` that should represent where the button was clicked,
 * and element-composer features, like current signed up user and http client headers
 * @param properties
 * @param args
 * @param elementComposerProps
 * @param options
 * @returns
 */
export function interpolateCustomComponentProps (
  properties: Record<string, any>,
  args: any[] = [],
  elementComposerProps: Record<string, any> = {},
  options = handlebarsCompileOptions
): Record<string, any> {
  const stringifiedProps = JSON.stringify(properties)

  const rawObjectNormalizatedProps = stringifiedProps.replace(
    /"({{rawObject [^}]*}})"/gm,
    (match) => {
      const matchWithoutQuote = match.replace(/^"(.*)"$/, '$1')
      return Handlebars.compile(matchWithoutQuote, options)({args, ...elementComposerProps})
    }
  )

  const compiledProps = Handlebars.compile(rawObjectNormalizatedProps, handlebarsCompileOptions)({args, ...elementComposerProps})

  return JSON.parse(compiledProps)
}
