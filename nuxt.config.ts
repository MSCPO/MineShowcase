import content from '@originjs/vite-plugin-content'
// import { pwa } from './config/pwa'

export default defineNuxtConfig({
    vue: {
        compilerOptions: {},
    },
    compatibilityDate: 'latest',
    devServer: {
        host: '127.0.0.1',
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
        indexable: true,
    },
    experimental: {
        buildCache: true,
        asyncEntry: true,
        writeEarlyHints: true,
        payloadExtraction: true,
        componentIslands: true,
    },
    nitro: {
        static: true,
        compressPublicAssets: {
            gzip: true,
            brotli: true,
        },
        prerender: {
            crawlLinks: true,
            routes: ['/robots.txt', '/sitemap.xml'],
            failOnError: false,
        },
        esbuild: {
            options: {
                target: 'esnext',
                minify: true,
            },
        },
        minify: true,
    },
    build: {
        analyze: {
            analyzerMode: 'static',
            openAnalyzer: false,
        },
        transpile: ['ant-design-vue'],
    },
    features: {
        inlineStyles: true,
    },
    app: {
        head: {
            title: 'Minecraft集体宣传组织(MSCPO)',
            titleTemplate: '%s | MSCPO',
            viewport:
                'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
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
            script: [
                {
                    src: 'https://umami.crashvibe.cn/script.js',
                    defer: true,
                    'data-domains': 'mscpo.crashvibe.cn,mscpo.1fu.top',
                    'data-website-id': '73146bad-70d1-47e1-bfe4-9f2b4a9af4c8',
                },
            ],
        },
        pageTransition: {
            name: 'page',
            mode: 'out-in',
        },
        buildAssetsDir: '_nuxt', // 优化构建资源目录
    },

    hub: {
        cache: true,
    },
    vite: {
        plugins: [content()],
        build: {
            minify: 'terser',
            cssCodeSplit: true, // CSS 代码分割
            chunkSizeWarningLimit: 1500, // 提高 chunk 大小限制
            terserOptions: {
                compress: {
                    drop_console: true,
                    drop_debugger: true,
                    pure_funcs: ['console.log'], // 移除所有 console.log
                },
                format: {
                    comments: false, // 移除注释
                },
            },
        },
        css: {
            preprocessorOptions: {
                less: {
                    javascriptEnabled: true, // Ant Design 需要
                },
            },
        },
    },

    devtools: {
        enabled: true,
    },
    styleExtractor: {
        minify: true, // 是否开启压缩
        removeUnused: false,
    },
    modules: [
        '@nuxtjs/seo',
        '@nuxthub/core',
        '@pinia/nuxt',
        '@ant-design-vue/nuxt',
        'nuxt-style-extractor',
        '@hypernym/nuxt-anime',
        '@nuxt/content',
    ],
    antd: {
        extractStyle: true,
    },
    ssr: true,
    runtimeConfig: {
        public: {
            commitHash: process.env.NUXT_PUBLIC_COMMIT_HASH || undefined,
        },
    },
})
