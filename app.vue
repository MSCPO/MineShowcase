<script setup lang="ts">
useHead({
    link: [
        {
            rel: 'preconnect',
            href: 'https://mscpoapi.crashvibe.cn',
            crossorigin: 'anonymous',
        },
        { rel: 'dns-prefetch', href: 'https://mscpoapi.crashvibe.cn' },
    ],
})

import { darkTheme, lightTheme } from 'naive-ui'
import { ref, watchEffect, onMounted, onUnmounted } from 'vue'

const theme = ref(darkTheme)

const updateTheme = (e?: MediaQueryListEvent) => {
    const isDarkMode = e
        ? e.matches
        : window.matchMedia('(prefers-color-scheme: dark)').matches
    theme.value = isDarkMode ? darkTheme : lightTheme
}

watchEffect(() => {
    updateTheme()
})

onMounted(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', updateTheme)
})

onUnmounted(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.removeEventListener('change', updateTheme)
})
</script>

<template>
    <naive-config :theme="theme">
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </naive-config>
</template>
