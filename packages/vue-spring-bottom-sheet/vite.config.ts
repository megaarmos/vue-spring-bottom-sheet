import { resolve } from 'path'
import Vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import Dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    Vue(),
    Dts({
      insertTypesEntry: true,
      cleanVueFileName: true,
      tsconfigPath: resolve(__dirname, 'tsconfig.app.json'),
    }),
  ],
  build: {
    lib: {
      formats: ['es'],
      name: 'vue-spring-bottom-sheet',
      fileName: (_, name) => {
        return `${name}.mjs`
      },
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
      },
      cssFileName: 'style',
    },
    rollupOptions: {
      external: ['vue', '@vueuse/core', '@vueuse/integrations/useFocusTrap'],
    },
  },
})
