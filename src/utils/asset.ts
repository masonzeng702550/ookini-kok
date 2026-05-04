/**
 * Resolve a public-folder path against Vite's BASE_URL so it works under
 * any GitHub Pages subpath (e.g. /ookini-kok/) as well as in dev (`/`).
 *
 * Pass the path WITHOUT a leading slash, e.g. assetPath('photos/foo.jpg').
 * A leading slash is tolerated and stripped.
 */
export function assetPath(path: string): string {
  const stripped = path.replace(/^\//, '');
  return `${import.meta.env.BASE_URL}${stripped}`;
}
