<script setup lang="ts">
import { ref } from "vue";
import {
  lightTheme,
  NForm,
  NFormItem,
  NButton,
  NInput,
  NRow,
  NCol,
  NConfigProvider,
} from "naive-ui";
import { ServerAPI } from "../../hooks/api";
import { useRequest } from "alova/client";
import reCaptchaButton from "../../components/Recaptcha/ReCaptchaV3.vue";

const form = ref({
  account: "",
  password: "",
  captchaResponse: "",
});

const rules = {
  account: [
    {
      required: true,
      message: "请输入账户",
      trigger: "blur",
    },
  ],
  password: [
    {
      required: true,
      message: "请输入密码",
      trigger: "blur",
    },
  ],
  captchaResponse: [
    {
      required: true,
      message: "请完成人机验证",
      trigger: "blur",
    },
  ],
};

interface SiteKey {
  recapcha_sitekey: string;
}

interface Login {
  access_token: string;
  token_type: string;
}

const loading = ref(false);

const getSiteKey = () => ServerAPI.Get<SiteKey>("/v1/reCAPTCHA_site_key");
const { data } = useRequest(getSiteKey());
const login = (data: {
  username: string;
  password: string;
  captcha_response: string;
}) => ServerAPI.Post<Login>("/v1/login", data);

const token = ref("");

const handleSubmit = async () => {
  // 发送请求到后端验证reCaptcha、用户名和密码
  const { data } = useRequest(
    login({
      username: form.value.account,
      password: form.value.password,
      captcha_response: token.value,
    }),
  );

  // 登录成功，保存token
  if (data.value.access_token) {
    localStorage.setItem("token", data.value.access_token);
    location.href = "/";
  }
};
</script>

<template>
  <n-config-provider :theme="lightTheme">
    <div class="layout">
      <div class="l_body">
        <transition name="fade-in">
          <h1>MineShowcase</h1>
        </transition>
        <transition name="fade-in">
          <h2>管理实用程序</h2>
        </transition>
      </div>
      <div class="r_body">
        <h2>登录</h2>
        <n-form :model="form" :rules="rules">
          <n-form-item path="account" label="账户">
            <n-input v-model:value="form.account" @keydown.enter.prevent />
          </n-form-item>
          <n-form-item path="password" label="密码">
            <n-input
              type="password"
              v-model:value="form.password"
              @keydown.enter.prevent
            />
          </n-form-item>
          <n-row :gutter="[0, 24]">
            <n-col :span="24">
              <div style="display: flex; justify-content: flex-end">
                <reCaptchaButton
                  v-if="data"
                  v-model="token"
                  :siteKey="data.recapcha_sitekey"
                  action="submit"
                >
                  <n-button
                    type="primary"
                    :loading="loading"
                    @click="handleSubmit()"
                  >
                    登录
                  </n-button>
                </reCaptchaButton>
                <n-button v-else type="primary" :loading="true">
                  验证失败
                </n-button>
              </div>
            </n-col>
          </n-row>
        </n-form>
      </div>
    </div>
  </n-config-provider>
</template>

<style scoped lang="less">
.layout {
  box-sizing: border-box;
  height: 100vh;
  background-image: url("../../assets/bg.webp");
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;

  .l_body {
    box-sizing: border-box;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    h1 {
      text-align: center;
      font-size: 50px;
      font-weight: bold;
      color: transparent;
      background: linear-gradient(to right, #32defd, #f74598);
      -webkit-background-clip: text;
      background-clip: text;
      opacity: 0;
      animation: fadeIn 1s forwards;
    }

    h2 {
      text-align: center;
      font-size: 25px;
      color: white;
      opacity: 0;
      animation: fadeIn 1.5s forwards;
    }
  }

  .r_body {
    box-sizing: border-box;
    width: 400px;
    padding: 2rem;
    background-color: rgba(255, 255, 255, 0.6);
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    margin-right: 8rem;
    opacity: 0;
    animation: fadeIn 2s forwards;

    h2 {
      margin-bottom: 20px;
      text-align: center;
    }

    .n-form-item {
      margin-bottom: 20px;
    }
  }

  @keyframes fadeIn {
    0% {
      opacity: 0;
      transform: translateY(20px);
    }

    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media screen and (max-width: 768px) {
    flex-direction: column;
    padding: 20px;

    .l_body {
      padding-bottom: 20px;
    }

    .r_body {
      width: 100%;
      margin-right: 0;
    }
  }
}
</style>
