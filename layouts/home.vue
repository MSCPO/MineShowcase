<script setup lang="ts">
// 空的首页布局，不包含导航栏和侧边栏
</script>

<template>
    <div class="layout">
        <header class="header">
            <Header />
        </header>
        <div class="main">
            <div class="home-layout">
                <slot />
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
@import '../assets/css/default.less';
.home-layout {
    width: 100%;
}
</style>
