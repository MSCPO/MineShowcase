<script setup lang="ts">
import { ref } from 'vue'
import { ServerAPI } from '../../hooks/api'
import { useRequest } from 'alova/client'
import reCaptcha from '../../components/Recaptcha/ReCaptchaV3.vue'
import type { SiteKey, Login } from '../../hooks/type_models'
// import type { NotificationType } from 'naive-ui/es/notification'
// import { createDiscreteApi } from 'naive-ui'

const form = ref({
    account: '',
    password: '',
})

const rules = {
    account: [
        {
            required: true,
            message: '请输入登录账号/邮箱',
            trigger: 'blur',
        },
    ],
    password: [
        {
            required: true,
            message: '请输入密码',
            trigger: 'blur',
        },
    ],
}
const { notification } = createDiscreteApi(['notification'])

const Notify = (info: {
    type: NotificationType
    content: string
    meta: string
    duration: number
}) =>
    notification[info.type]({
        content: info.content,
        meta: info.meta,
        duration: info.duration,
        keepAliveOnHover: true,
    })

const isLoaded = ref(false)
const captchaKey = ref(0) // 用于强制刷新reCaptcha组件

const getSiteKey = () => ServerAPI.Get<SiteKey>('/v1/reCAPTCHA_site_key')
const { data } = useRequest(getSiteKey())

const { send: login } = useRequest(
    (username_or_email: string, password: string, captcha_response: string) =>
        ServerAPI.Post<Login>('/v1/login', {
            username_or_email,
            password,
            captcha_response,
        }),
    { immediate: false },
)

const token = ref('')

const handleSubmit = async () => {
    const response = await login(
        form.value.account,
        form.value.password,
        token.value,
    )

    if (response.code === 200) {
        Notify({
            type: 'success',
            content: '登录成功',
            meta: '欢迎回来',
            duration: 2000,
        })
        await new Promise((resolve) => setTimeout(resolve, 1000))
        localStorage.setItem('token', response.access_token)
        localStorage.setItem('token_type', response.token_type)
        window.location.href = '/'
    } else if (response.code === 400) {
        Notify({
            type: 'error',
            content: 'reCAPTCHA 验证失败',
            meta: '请重试',
            duration: 3000,
        })
        captchaKey.value += 1
    } else if (response.code === 401) {
        Notify({
            type: 'error',
            content: '登录失败',
            meta: '用户名或密码错误',
            duration: 3000,
        })
    }
    captchaKey.value++
    token.value = ''
}
</script>

<template>
    <h2>登录</h2>
    <n-form :model="form" :rules="rules" @submit.prevent="handleSubmit">
        <n-form-item path="account" label="账号/邮箱">
            <n-input
                v-model:value="form.account"
                @keydown.enter.prevent
                placeholder="输入尊贵的邮箱 或 sexy的用户名"
            />
        </n-form-item>
        <n-form-item path="password" label="密码">
            <n-input
                type="password"
                v-model:value="form.password"
                @keydown.enter.prevent
                placeholder="输入绚丽的密码"
            />
        </n-form-item>
        <n-row :gutter="[0, 24]">
            <n-col :span="24">
                <div style="display: flex; justify-content: flex-end">
                    <reCaptcha
                        v-if="data"
                        v-model="token"
                        @loaded="isLoaded"
                        :siteKey="data.recapcha_sitekey"
                        action="submit"
                        :key="captchaKey"
                    >
                        <n-button
                            type="primary"
                            :loading="token === ''"
                            @click="handleSubmit()"
                        >
                            登录
                        </n-button>
                    </reCaptcha>
                    <n-button v-else type="primary" :loading="true">
                        加载中...
                    </n-button>
                </div>
            </n-col>
        </n-row>
    </n-form>
</template>
