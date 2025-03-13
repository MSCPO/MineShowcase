<script setup lang="ts">
useHead({
    link: [
        {
            rel: 'preconnect',
            href: 'https://mscpoapi.tblstudio.cn',
            crossorigin: 'anonymous',
        },
        { rel: 'dns-prefetch', href: 'https://mscpoapi.tblstudio.cn' },
    ],
})
</script>

<template>
    <a-extract-style>
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </a-extract-style>
</template>
