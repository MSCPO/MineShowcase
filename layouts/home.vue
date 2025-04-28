<script setup lang="ts">
// 空的首页布局，不包含导航栏和侧边栏
</script>

<template>
  <div class="home-layout">
    <main>
      <slot />
    </main>
  </div>
</template>

<style lang="less" scoped>
.home-layout {
  width: 100%;
  min-height: 100vh;
}
</style>