import * as esbuild from 'esbuild'

await esbuild.build({
  entryPoints: ['sandbox/index.ts'],
  bundle: true,
  platform: 'node',
  packages: 'external',
  format: 'esm',
  outdir: 'dist',
  loader: { '.svg': 'text' }
})
