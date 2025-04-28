<script setup lang="ts">
import { theme } from 'ant-design-vue'
import '~/assets/css/index.less'

const isDarkMode = useState<boolean>('isDarkMode', () => false)
const route = useRoute()
const key = computed(() => route.path)

const updateTheme = (e?: MediaQueryListEvent) => {
    if (typeof window !== 'undefined') {
        isDarkMode.value = e
            ? e.matches
            : window.matchMedia('(prefers-color-scheme: dark)').matches
    }

    // 设置全局 HTML `data-theme`，便于 CSS 适配
    document.documentElement.setAttribute(
        'data-theme',
        isDarkMode.value ? 'dark' : 'light',
    )
}

onMounted(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', updateTheme)
    updateTheme()
    onUnmounted(() => {
        mediaQuery.removeEventListener('change', updateTheme)
    })
})
</script>

<template>
    <!-- <NuxtPwaManifest /> -->
    <a-extract-style>
        <a-config-provider
            :theme="{
                algorithm: isDarkMode
                    ? theme.darkAlgorithm
                    : theme.defaultAlgorithm,
            }"
        >
            <NuxtLayout :key="key">
                <NuxtPage keepalive :key="key" />
            </NuxtLayout>
        </a-config-provider>
    </a-extract-style>
</template>
