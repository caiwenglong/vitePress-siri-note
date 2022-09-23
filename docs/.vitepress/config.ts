import { defineConfig } from 'vitepress'
import { nav } from './utils/nav'
import { sidebar } from './utils/sidebar'
const config = defineConfig({
    title: 'siri笔记',

    themeConfig: {
        outlineTitle: '锚点',
        nav,
        sidebar
    }
})

export default config