<script lang="ts" setup>
import { ref, defineProps, defineEmits } from "vue";
import { IReCaptchaLoaderOptions } from "recaptcha-v3/dist/ReCaptchaLoader";
import { load as loadReCaptcha, ReCaptchaInstance } from "recaptcha-v3";

// 定义组件 props
const props = defineProps({
  siteKey: {
    type: String,
    required: true,
  },
  loaderOptions: {
    type: Object as () => IReCaptchaLoaderOptions,
    default: () => ({ useRecaptchaNet: true }),
  },
  action: {
    type: String,
    required: true,
  },
  modelValue: String,
});

const emits = defineEmits(["update:modelValue", "execute"]);

// 组件状态
const isLoaded = ref(false);
const instance = ref<ReCaptchaInstance | undefined>(undefined);
const loading = ref(false);

// 初始化 reCAPTCHA
function initializeReCaptcha() {
  // 调用 loadReCaptcha 函数加载 reCAPTCHA
  return loadReCaptcha(props.siteKey, props.loaderOptions);
}

// 执行 reCAPTCHA 验证
async function executeRecaptcha(action: string) {
  if (instance.value) {
    // 调用 reCAPTCHA 实例的 execute 方法进行验证
    const result = await instance.value.execute(action);
    // 发出 execute 事件，传递验证结果
    emits("execute", result);
    return result;
  }
  return undefined;
}

// 更新 Token
async function updateToken() {
  loading.value = true;
  try {
    // 执行 reCAPTCHA 验证
    const token = await executeRecaptcha(props.action);
    console.log("reCAPTCHA  token:", token);
    // 发出 update:modelValue 事件，更新绑定的 Token
    emits("update:modelValue", token);
  } catch (error) {
    console.error("reCAPTCHA  验证失败:", error);
  } finally {
    loading.value = false;
  }
}

// 初始化 reCAPTCHA 实例
initializeReCaptcha()
  .then((wrapper) => {
    isLoaded.value = true;
    instance.value = wrapper;
    // 发出 loaded 事件，标记 reCAPTCHA 已加载完成
    updateToken();
  })
  .catch((error) => {
    console.error("reCAPTCHA  加载失败:", error);
  });
</script>

<template>
  <div :disabled="!isLoaded || loading">
    <slot></slot>
  </div>
</template>

<style scoped>
div:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
