<script lang="ts" setup>
import {
  ref,
  provide,
  defineProps,
  defineEmits,
  InjectionKey,
  watch,
} from "vue";
import { IReCaptchaLoaderOptions } from "recaptcha-v3/dist/ReCaptchaLoader";
import { load as loadReCaptcha, ReCaptchaInstance } from "recaptcha-v3";

// 定义注入键
const VueReCaptchaInjectKey: InjectionKey<ReCaptchaComposition> = Symbol(
  "VueReCaptchaInjectKey",
);

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

const emits = defineEmits(["update:modelValue"]);

// 组件状态
const isLoaded = ref(false);
const instance = ref<ReCaptchaInstance | undefined>(undefined);
const loading = ref(false);

// 初始化 reCAPTCHA
function initializeReCaptcha() {
  return loadReCaptcha(props.siteKey, props.loaderOptions);
}

// 执行 reCAPTCHA 验证
function executeRecaptcha(action: string) {
  return instance.value?.execute(action);
}

// 更新 Token
async function updateToken() {
  loading.value = true;
  try {
    const token = await executeRecaptcha(props.action);
    console.log("reCAPTCHA   token:", token);
    emits("update:modelValue", token);
  } catch (error) {
    console.error("reCAPTCHA   验证失败:", error);
  } finally {
    loading.value = false;
  }
}

// 初始化 reCAPTCHA 实例
initializeReCaptcha()
  .then((wrapper) => {
    isLoaded.value = true;
    instance.value = wrapper;
    updateToken();
  })
  .catch((error) => {
    console.error("reCAPTCHA   加载失败:", error);
  });

// 提供注入值
provide(VueReCaptchaInjectKey, {
  isLoaded,
  instance,
  executeRecaptcha,
});

// 定义提供的接口
interface ReCaptchaComposition {
  isLoaded: ReturnType<typeof ref<boolean>>;
  instance: ReturnType<typeof ref<ReCaptchaInstance | undefined>>;
  executeRecaptcha: (action: string) => Promise<string | undefined>;
}
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
