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
</script>

<template>
    <a-extract-style>
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </a-extract-style>
</template>
