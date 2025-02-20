<script setup lang="ts">
useHead({
  title: "MineShowcase",
  meta: [
    {
      name: "description",
      content: "MineShowcase 是一个以 MSCPO/ServerAPI 作为后端的MSCPO页面",
    },
  ],
  bodyAttrs: {
    class: "test",
  },
  script: [{ innerHTML: "console.log('Hello world')" }],
});
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
  </div>
  <NuxtPage />
</template>
