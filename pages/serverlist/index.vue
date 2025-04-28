<script setup lang="ts">
import ServerList from '@/components/ServerList/ServerList.vue'

definePageMeta({
    sidebar: ['Stats', 'Recommend', 'Filter'],
})

const title = useState<string>('pageTitle')
title.value = 'MSCPO'
useHead({
    title: title,
})
</script>

<template>
    <ServerList />
</template>
