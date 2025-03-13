<script setup lang="ts">
import { ref } from 'vue'
import { ServerAPI } from '../../hooks/api'
import { useRequest } from 'alova/client'
import reCaptcha from '../../components/Recaptcha/ReCaptchaV3.vue'
import type { SiteKey, Login } from '../../hooks/type_models'
import { notification } from 'ant-design-vue'

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
        notification.success({
            message: '登录成功',
            duration: 4,
            description: '欢迎回来!',
        })
        await new Promise((resolve) => setTimeout(resolve, 1000))
        localStorage.setItem('token', response.access_token)
        localStorage.setItem('token_type', response.token_type)
        window.location.href = '/'
    } else if (response.code === 400) {
        notification.error({
            message: 'reCAPTCHA 验证失败',
            duration: 4,
            description: '请重试',
        })
        captchaKey.value += 1
    } else if (response.code === 401) {
        notification.error({
            message: '登录失败',
            duration: 4,
            description: '用户名或密码错误',
        })
    }
    captchaKey.value++
    token.value = ''
}
</script>

<template>
    <h2>登录</h2>
    <a-form :model="form" @submit.prevent="handleSubmit">
        <a-form-item :rules="rules.account" name="account" label="账号/邮箱">
            <a-input
                v-model:value="form.account"
                @keydown.enter.prevent
                placeholder="输入尊贵的邮箱 或 sexy的用户名"
            />
        </a-form-item>
        <a-form-item :rules="rules.password" name="password" label="密码">
            <a-input-password
                v-model:value="form.password"
                @keydown.enter.prevent
                placeholder="输入绚丽的密码"
            />
        </a-form-item>
        <a-row :gutter="[0, 24]">
            <a-col :span="24">
                <div style="display: flex; justify-content: flex-end">
                    <reCaptcha
                        v-if="data"
                        v-model="token"
                        @loaded="isLoaded"
                        :siteKey="data.recapcha_sitekey"
                        action="submit"
                        :key="captchaKey"
                    >
                        <a-button
                            type="primary"
                            :loading="token === ''"
                            @click="handleSubmit()"
                        >
                            登录
                        </a-button>
                    </reCaptcha>
                    <a-button v-else type="primary" :loading="true">
                        加载中...
                    </a-button>
                </div>
            </a-col>
        </a-row>
    </a-form>
</template>
