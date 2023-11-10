import path from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'PopperTS',
      formats: ['es'], // Generating only ES module
      fileName: () => `index.js`, // Simplified file name
    },
    rollupOptions: {
      external: [], // specify external dependencies here if any
      plugins: [
      ],
      // No need to specify globals or format since it's only ES module
    },
  },
})
