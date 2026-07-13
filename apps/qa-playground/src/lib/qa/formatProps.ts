const INTERNAL_KEYS = new Set(['_qaVariant', '_qaPreviewState']);

export function stripQaInternalProps(props: Record<string, unknown>): Record<string, unknown> {
  const next: Record<string, unknown> = { ...props };
  for (const k of INTERNAL_KEYS) {
    delete next[k];
  }
  return next;
}

export function formatPropsLine(props: Record<string, unknown>): string {
  const clean = stripQaInternalProps(props);
  const keys = Object.keys(clean).sort();
  if (keys.length === 0) return '—';
  return keys
    .map((k) => {
      const v = clean[k];
      if (v === undefined) return null;
      const val =
        typeof v === 'string'
          ? `"${v}"`
          : typeof v === 'boolean' || typeof v === 'number'
            ? String(v)
            : JSON.stringify(v);
      return `${k}=${val}`;
    })
    .filter(Boolean)
    .join(' + ');
}

/** Multiline props for Story-style “Show code” panel. */
export function formatPropsMultiline(props: Record<string, unknown>): string {
  const clean = stripQaInternalProps(props);
  const keys = Object.keys(clean).sort();
  if (keys.length === 0) return '/* no public props */';
  return keys
    .map((k) => {
      const v = clean[k];
      if (v === undefined) return null;
      const val =
        typeof v === 'string'
          ? `"${v}"`
          : typeof v === 'boolean' || typeof v === 'number'
            ? String(v)
            : JSON.stringify(v);
      return `${k}=${val}`;
    })
    .filter(Boolean)
    .join('\n');
}
