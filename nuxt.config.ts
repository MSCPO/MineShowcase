import content from '@originjs/vite-plugin-content'
export default defineNuxtConfig({
    devServer: {
        host: '0.0.0.0',
        port: 3000,
    },
    site: {
        url: 'https://mscpo.crashvibe.cn',
        name: 'Minecraft集体宣传组织(MSCPO)',
        description:
            'Minecraft集体宣传组织(MSCPO) - 专业的Minecraft服务器宣传与技术交流平台，提供最新服务器资讯、开服教程和集体宣传片',
        defaultLocale: 'zh-cn',
        cacheMaxAgeSeconds: 24 * 3600,
        autoLastmod: true,
    },
    experimental: {
        buildCache: true,
        asyncEntry: true,
    },
    nitro: {
        static: true,
        compressPublicAssets: true,
        prerender: {
            crawlLinks: true,
            routes: ['/', '/robots.txt', '/sitemap.xml'],
        },
        esbuild: {
            options: {
                target: 'esnext',
            },
        },
    },
    build: {
        analyze: { analyzerMode: 'static' },
    },
    features: {
        inlineStyles: true,
    },
    app: {
        head: {
            title: 'Minecraft集体宣传组织(MSCPO)',
            titleTemplate: '%s | MSCPO',
            viewport:
                'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"',
            meta: [
                { charset: 'utf-8' },
                {
                    name: 'keywords',
                    content:
                        'Minecraft服务器,MC服务器宣传,我的世界技术交流,集体宣传片,开服教程',
                },
                {
                    property: 'og:title',
                    content:
                        'Minecraft集体宣传组织(MSCPO) - 服务器宣传与技术交流平台',
                },
                { property: 'og:type', content: 'website' },
            ],
            link: [{ rel: 'icon', href: '/logo.webp', sizes: 'any' }],
        },
        pageTransition: {
            name: 'page',
            mode: 'out-in',
        },
    },
    hub: {
        cache: true,
    },
    vite: {
        plugins: [content()],
        build: {
            minify: 'terser',
            terserOptions: {
                compress: {
                    drop_console: true,
                    drop_debugger: true,
                },
            },
        },
    },
    compatibilityDate: '2025-03-03',
    devtools: {
        enabled: true,
    },
    modules: ['@nuxtjs/seo', '@nuxthub/core', 'nuxt-og-image', '@ant-design-vue/nuxt'],
    // Ant Design Vue Config
    antd: {
        extractStyle: true,
    }
})
