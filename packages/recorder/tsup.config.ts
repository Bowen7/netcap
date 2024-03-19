import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['sandbox/index.ts'],
  loader: {
    '.svg': 'text'
  },
  onSuccess: 'node dist/index.js',
  noExternal: [/@vtape/],
  skipNodeModulesBundle: true
})
