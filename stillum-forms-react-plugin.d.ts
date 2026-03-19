/**
 * Shim locale: TypeScript non risolve sempre i tipi del subpath `./plugin`
 * (es. .d.mts / exports) su vite.config → evita implicit any.
 */
declare module '@tecnosys/stillum-forms-react/plugin' {
  import type { Plugin } from 'vite';

  export type SharedHostGlobalsOptions = {
    extra?: Record<string, string>;
  };

  export function stillumSharedPlugin(
    options?: SharedHostGlobalsOptions
  ): Plugin;

  export default stillumSharedPlugin;
}
