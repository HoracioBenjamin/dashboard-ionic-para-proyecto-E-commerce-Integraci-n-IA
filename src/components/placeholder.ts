/**
 * Placeholder local inline (SVG data-URI): cero red, imposible que falle.
 * Úsalo como src de respaldo y blinda los onError con:
 *   if (!e.target.src.startsWith('data:')) e.target.src = PLACEHOLDER_IMG;
 */
export const PLACEHOLDER_IMG =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="#E9ECEF"/><g fill="none" stroke="#8a8f98" stroke-width="3"><rect x="28" y="34" width="44" height="34" rx="4"/><circle cx="40" cy="46" r="4" fill="#8a8f98" stroke="none"/><path d="M28 62l12-12 8 8 10-10 14 14"/></g><text x="50" y="86" font-family="Arial,sans-serif" font-size="11" fill="#002855" text-anchor="middle">Sin imagen</text></svg>`
  );
