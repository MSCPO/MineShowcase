<script setup lang="ts">
import lang from "../languages/index";
import Logo from "../assets/logo.webp";
import { ref, onMounted } from "vue";
import { ServerAPI_Token } from "../hooks/api";
import { useRequest } from "alova/client";

interface User {
  username: string;
  email: string;
  display_name: string;
  avatar_url: string;
  role: string;
  is_active: boolean;
  id: number;
  created_at: string;
  last_login: string;
}

const { data, onSuccess } = useRequest(ServerAPI_Token.Get<User>("/v1/me"));

const avatar = ref(Logo);
onMounted(() => {
  const token = localStorage.getItem("token");
  onSuccess(() => {
    if (token) {
      avatar.value = data.value.avatar_url;
    }
  });
});
</script>

<template>
  <div class="c_header">
    <div class="logo">
      <img src="/logo.webp" />
      <h2>{{ lang.NavBar.title }}</h2>
    </div>
    <div class="account">
      <n-avatar size="medium" :src="avatar" />
      <NuxtLink
        class="login"
        to="/user"
        v-if="data"
        v-text="data.username"
      ></NuxtLink>
      <NuxtLink class="login" to="/login" v-else>登录</NuxtLink>
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
