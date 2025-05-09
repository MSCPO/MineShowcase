<script setup lang="ts">
const { data: testMd, error } = await useAsyncData(() => queryCollection('content').path('/about/test').first())

if (error.value) {
  console.error('Failed to load markdown content:', error.value)
}

useSeoMeta({
  title: testMd.value?.title || 'Default Title',
  description: testMd.value?.description || 'Default Description'
})
</script>

<template>
  <ContentRenderer v-if="testMd" :value="testMd" />
  <div v-else>Home not found</div>
</template>
