export function sanitizeLabel(label: string): string {
  return label.replace(/\s+/g, '.').replace(/[^a-zA-Z0-9._-]+/g, '-');
}
