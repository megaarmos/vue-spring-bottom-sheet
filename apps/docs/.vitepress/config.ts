import { defineConfig } from 'vitepress'
import { tabsMarkdownPlugin } from 'vitepress-plugin-tabs'
import { npmCommandsMarkdownPlugin } from 'vitepress-plugin-npm-commands'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  markdown: {
    config(md) {
      ;(md.use(tabsMarkdownPlugin), md.use(npmCommandsMarkdownPlugin))
    },
  },
  title: 'Vue Spring Bottom Sheet',
  description: '😎 Modern and 🚀 Performant Bottom Sheet for Vue.js',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/installation' },
      { text: 'API', link: '/guide/props' },
      { text: 'Examples', link: '/examples' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Quick Start', link: '/guide/quickstart' },
            { text: 'Usage', link: '/guide/usage' },
            { text: 'Nuxt Integration', link: '/guide/nuxt' },
          ],
        },
        {
          text: 'API Reference',
          items: [
            { text: 'Props', link: '/guide/props' },
            { text: 'Events', link: '/guide/events' },
            { text: 'Methods', link: '/guide/methods' },
          ],
        },
        {
          text: 'Customization',
          items: [{ text: 'Styling', link: '/guide/styling' }],
        },
      ],
    },

    search: {
      provider: 'local',
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/douxcode/vue-spring-bottom-sheet' }],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © ' + new Date().getFullYear(),
    },
  },
})
