<script setup lang="ts">
const { data: testMd } = await useAsyncData(() => queryCollection('content').path('/about/test').first())

useSeoMeta({
  title: testMd.value?.title,
  description: testMd.value?.description
})
</script>

<template>
  <ContentRenderer v-if="testMd" :value="testMd" />
  <div v-else>Home not found</div>
</template>
