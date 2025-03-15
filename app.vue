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
        <a-config-provider>
            <NuxtLayout>
                <NuxtPage />
            </NuxtLayout>
        </a-config-provider>
    </a-extract-style>
</template>
