import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Neo2DB',
    description:
      'Auto-fill Douban Music submissions from NeoDB, and quickly search between Douban and NeoDB with direct page navigation.',
    permissions: ['activeTab', 'scripting', 'storage', 'webNavigation'],
    host_permissions: [
      'https://neodb.social/*',
      'https://music.douban.com/*',
      'https://movie.douban.com/*',
      'https://book.douban.com/*',
    ],
    icons: {
      16: 'icon/16.png',
      32: 'icon/32.png',
      48: 'icon/48.png',
      96: 'icon/96.png',
      128: 'icon/128.png',
    },
  },
})
