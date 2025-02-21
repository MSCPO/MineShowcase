<script setup lang="ts">
import lang from '../languages/index'
</script>

<template>
    <div class="navbar">
        {{ lang.NavBar.title }}
    </div>
</template>

<style scoped lang="scss">
.navbar {
    display: flex;
    height: 100%;
    width: 100%;
}
</style>