'use client'

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

const titleCase = (value: string) =>
  value.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]/g, ' ').replace(/^\w/, (letter) => letter.toUpperCase())

export function JsonForm({
  value,
  onChange,
  path = []
}: {
  value: JsonValue
  onChange: (next: JsonValue) => void
  path?: string[]
}) {
  if (Array.isArray(value)) {
    const simple = value.every((item) => ['string', 'number', 'boolean'].includes(typeof item))
    if (simple) {
      return (
        <div className="editor-field">
          <label>{titleCase(path.at(-1) ?? 'Items')}</label>
          <textarea
            value={value.join('\n')}
            onChange={(event) => onChange(event.target.value.split('\n').filter(Boolean))}
          />
          <span className="editor-help">One item per line.</span>
        </div>
      )
    }
    return (
      <div className="editor-field">
        <label>{titleCase(path.at(-1) ?? 'Collection')}</label>
        <textarea
          value={JSON.stringify(value, null, 2)}
          onChange={(event) => {
            try { onChange(JSON.parse(event.target.value)) } catch { /* keep editing until valid */ }
          }}
          style={{ minHeight: 300 }}
        />
        <span className="editor-help">Collection editor · valid JSON is applied automatically.</span>
      </div>
    )
  }

  if (value && typeof value === 'object') {
    return (
      <>
        {Object.entries(value).map(([key, child]) => (
          <JsonForm
            key={[...path, key].join('.')}
            value={child}
            path={[...path, key]}
            onChange={(next) => onChange({ ...value, [key]: next })}
          />
        ))}
      </>
    )
  }

  const label = titleCase(path.join(' · '))
  if (typeof value === 'boolean') {
    return (
      <div className="editor-field">
        <label><input type="checkbox" checked={value} onChange={(event) => onChange(event.target.checked)} /> {label}</label>
      </div>
    )
  }
  const stringValue = value == null ? '' : String(value)
  const long = stringValue.length > 95 || ['summary', 'positioning', 'problem', 'contribution', 'outcome'].includes(path.at(-1) ?? '')
  return (
    <div className="editor-field">
      <label htmlFor={path.join('-')}>{label}</label>
      {long ? (
        <textarea id={path.join('-')} value={stringValue} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input id={path.join('-')} value={stringValue} onChange={(event) => onChange(event.target.value)} />
      )}
    </div>
  )
}
