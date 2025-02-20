<script setup lang="ts">
import lang from "../languages/index";
</script>

<template>
  <div class="c_header">
    <div class="logo">
      <img src="/logo.webp" />
      <h2>{{ lang.NavBar.title }}</h2>
    </div>
    <div class="account">
      <img src="/logo.webp" />
      <NuxtLink class="login" to="/login">登录</NuxtLink>
    </div>
  </div>
</template>

<style scoped lang="less">
.c_header {
  display: flex;
  align-items: center;
  height: 100%;
  width: 100%;
  justify-content: space-between;

  .logo {
    display: flex;
    gap: 1rem;
    align-items: center;
    height: 2rem;
    img {
      height: 100%;
    }
  }
  .account {
    display: flex;
    gap: 1rem;
    align-items: center;
    height: 2rem;
    img {
      height: 100%;
    }
    .login {
      font-size: 1rem;
    }
  }
}
</style>
