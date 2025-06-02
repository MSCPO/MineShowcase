<script setup lang="ts">
import { ref } from 'vue'
import { useRequest, useForm } from 'alova/client'
import hCaptcha from '../Hcaptcha/HCaptcha.vue'
import type { SiteKey, Login, LoginData } from '@/api/models'
import { notification } from 'ant-design-vue'
import type { RuleObject } from 'ant-design-vue/lib/form/interface'

const { $serverAPI } = useNuxtApp()
const rules = {
    username_or_email: <RuleObject>[
        {
            required: true,
            message: '请输入登录账号/邮箱',
            trigger: 'blur',
        },
    ],
    password: <RuleObject>[
        {
            required: true,
            message: '请输入密码',
            trigger: 'blur',
        },
    ],
}

const captchaKey = ref(0) // 用于强制刷新hCaptcha组件

const { data: SiteKey } = useRequest(
    $serverAPI.Get<SiteKey>('/v1/hcaptcha_site_key'),
)

const LoginInit = reactive<LoginData>({
    username_or_email: '',
    password: '',
    captcha_response: '',
})

const { form: data, send: login } = useForm(
    (Data) => $serverAPI.Post<Login>('/v1/login', Data),
    {
        initialForm: LoginInit,
    },
).onSuccess(async (response) => {
    if (response.data.code === 200) {
        notification.success({
            message: '登录成功',
            duration: 4,
            description: '欢迎回来!',
        })
        await new Promise((resolve) => setTimeout(resolve, 3000))
        localStorage.setItem('token', response.data.access_token)
        localStorage.setItem('token_type', response.data.token_type)
        window.location.href = '/'
    } else if (response.data.code === 400) {
        notification.error({
            message: 'hCaptcha 验证失败',
            duration: 4,
            description: '请重试',
        })
        captchaKey.value += 1
    } else if (response.data.code === 401) {
        notification.error({
            message: '登录失败',
            duration: 4,
            description: '用户名或密码错误',
        })
    }
    captchaKey.value++
    response.data.access_token = ''
})
</script>

<template>
    <h2>登录</h2>
    <a-form :model="data" @submit.prevent="login">
        <a-form-item
            :rules="rules.username_or_email"
            name="username_or_email"
            label="账号/邮箱"
        >
            <a-input
                v-model:value="data.username_or_email"
                @keydown.enter.prevent
                placeholder="输入尊贵的邮箱 或 sexy的用户名"
            />
        </a-form-item>
        <a-form-item :rules="rules.password" name="password" label="密码">
            <a-input-password
                v-model:value="data.password"
                @keydown.enter.prevent
                placeholder="输入绚丽的密码"
            />
        </a-form-item>
        <a-row :gutter="[0, 24]">
            <a-col :span="24">
                <div style="display: flex; justify-content: flex-end">
                    <hCaptcha
                        v-if="SiteKey"
                        v-model="data.captcha_response"
                        :siteKey="SiteKey.hcaptcha_sitekey"
                        action="submit"
                        :key="captchaKey"
                        @execute="login"
                    >
                        <a-button type="primary">登录</a-button>
                    </hCaptcha>
                    <a-button v-else type="primary" loading>登录</a-button>
                </div>
            </a-col>
        </a-row>
    </a-form>
</template>
