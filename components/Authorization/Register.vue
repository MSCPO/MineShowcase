<script setup lang="ts">
import { ref, onBeforeUnmount, onMounted, computed } from 'vue'

import { useRequest } from 'alova/client'
import hCaptcha from '../Hcaptcha/HCaptcha.vue'
import type {
    SiteKey,
    Login,
    ReturnResponse,
    ReturnResponse_Register,
} from '@/api/models'
import { VueCropper } from 'vue-cropper'
import 'vue-cropper/dist/index.css'
import { notification, message } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import type { FormInstance, UploadChangeParam } from 'ant-design-vue'
const { $serverAPI } = useNuxtApp()

const options = computed(() => {
    const prefix = form.value.email.split('@')[0]
    const suffixes = ['@gmail.com', '@163.com', '@qq.com']
    return suffixes.map((suffix) => ({
        label: prefix + suffix,
        value: prefix + suffix,
    }))
})
// 在组件逻辑中添加
const regFormRef = ref<FormInstance | null>(null)
const previewUrl = ref('')
const showCropper = ref(false)
const cropper = ref<InstanceType<typeof VueCropper>>()
const uploadFile = ref<File>()

onBeforeUnmount(() => {
    if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value)
    }
})

const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
        message.error(' 文件格式错误：请选择图片文件')
        return false
    }

    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
        message.error(' 文件过大：请选择小于 2MB 的图片')
        return false
    }

    // 显示裁切模态框
    previewUrl.value = URL.createObjectURL(file)
    uploadFile.value = file
    showCropper.value = true
    return false // 阻止自动上传
}

// 文件上传状态变化处理
const handleChange = (info: UploadChangeParam) => {
    if (info.file.status === 'error') {
        message.error(' 上传失败')
    }
}

// 确认裁切
const confirmCrop = () => {
    cropper.value?.getCropBlob((blob: Blob) => {
        if (blob) {
            const ext = uploadFile.value?.name.split('.').pop() || 'png'
            const newFile = new File([blob], `avatar.${ext}`, {
                type: blob.type,
            })
            previewUrl.value = URL.createObjectURL(newFile)
            RegForm.value.avatar = newFile
            showCropper.value = false
        }
    })
}

// 清空上传列表
const clearUploadList = () => {
    showCropper.value = false
    RegForm.value.avatar = undefined
}

const RegToken = defineProps<{ token?: string }>()

// 表单相关逻辑
const form = ref({ email: '' })
const rules: Record<string, Rule[]> = {
    email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
}

// hCaptcha逻辑
const isLoaded = ref(false)
const site_key = ref('')
const { data } = useRequest($serverAPI.Get<SiteKey>('/v1/hcaptcha_site_key'), {
    immediate: true,
})

// 邮箱验证逻辑
const VerifyEmail = ref({
    regstatus: false,
    detail: '',
    style: { color: 'black' },
})

// 优化3: 使用正确的请求处理方式
const { send: verifyToken } = useRequest(
    (token: string) => $serverAPI.Post<ReturnResponse>(`/v1/verify/${token}`),
    { immediate: false },
)

onMounted(async () => {
    if (RegToken.token) {
        try {
            const response = await verifyToken(RegToken.token)
            if (response.code === 200) {
                VerifyEmail.value.regstatus = true
                VerifyEmail.value.detail = `ヾ(^▽^*))) ${response.detail}`
                VerifyEmail.value.style.color = 'green'
                notification.success({
                    message: '邮箱验证通过',
                    description: '邮箱验证成功,请填写详细信息',
                    duration: 2,
                })
            } else {
                VerifyEmail.value.detail = `〒▽〒 ${response.detail}`
                VerifyEmail.value.style.color = 'red'
                notification.error({
                    message: '邮箱验证失败',
                    description: '请检查邮箱验证链接是否正确',
                    duration: 2,
                })
            }
        } catch (error) {
            notification.error({
                message: '验证失败',
                duration: 2,
            })
        }
    }
})

// 注册表单逻辑
const RegForm = ref({
    f_password: '',
    s_password: '',
    display_name: '',
    avatar: undefined as File | undefined,
})

const RegRules: Record<string, Rule[]> = {
    avatar: [
        {
            validator: (rule: Rule, value: File | undefined) => {
                if (!value) {
                    return Promise.reject(new Error('请上传头像'))
                }
                return Promise.resolve()
            },
            trigger: 'change',
            required: true,
        },
    ],
    display_name: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
    ],
    f_password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
    s_password: [
        {
            required: true,
            validator: (rule: Rule, value: string) => {
                if (!value) {
                    return Promise.reject(new Error('请再次输入密码'))
                }
                if (RegForm.value.f_password !== value) {
                    return Promise.reject(new Error('两次输入的密码不一致'))
                }
                return Promise.resolve()
            },
            trigger: 'blur',
        },
    ],
}

const { send: registerUser } = useRequest(
    (formData: FormData) =>
        $serverAPI.Post<ReturnResponse_Register>('/v1/register', formData),
    { immediate: false },
)

const handleRegSubmit = async () => {
    try {
        await regFormRef.value?.validate()
    } catch (error) {
        notification.error({
            message: '表单验证失败',
            description: '请检查表单是否填写正确',
            duration: 2,
        })
        return
    }

    // 如果验证通过，继续注册逻辑
    if (!VerifyEmail.value.regstatus) {
        notification.error({
            message: '邮箱未验证',
            description: '请先验证邮箱',
            duration: 2,
        })
        return
    }

    const formData = new FormData()
    if (!RegForm.value.avatar) {
        notification.error({
            message: '头像未上传',
            description: '请上传头像',
            duration: 2,
        })
        return
    }

    const requestData = {
        captcha_response: site_key.value,
        password: RegForm.value.s_password,
        display_name: RegForm.value.display_name,
        token: RegToken.token,
    }

    formData.append('avatar', RegForm.value.avatar)
    formData.append('request', JSON.stringify(requestData))

    const response = await registerUser(formData)
    if (response.code === 200) {
        notification.success({
            message: '已成功注册！',
            description: '请用新的账户密码登录网站',
            duration: 2,
        })
    }
    if (response.code === 400) {
        notification.error({
            message: '请求参数错误',
            description: response.detail,
            duration: 2,
        })
    } else if (response.code === 422) {
        notification.error({
            message: 'hCaptcha 验证失败',
            description: response.detail,
            duration: 2,
        })
        captchaKey.value += 1
    } else if (response.code === 404) {
        notification.error({
            message: 'Token 未找到或已过期',
            description: response.detail,
            duration: 2,
        })
    } else if (response.code === 409) {
        notification.error({
            message: 'Token 未验证',
            description: response.detail,
            duration: 2,
        })
    } else if (response.code === 500) {
        notification.error({
            message: '服务器内部错误',
            description: response.detail,
            duration: 2,
        })
    }
    captchaKey.value++
    site_key.value = ''
}

// 邮箱验证请求处理
const { send: verifyEmail } = useRequest(
    () =>
        $serverAPI.Post<Login>('/v1/verifyemail', {
            email: form.value.email,
            captcha_response: site_key.value,
        }),
    { immediate: false },
)
const captchaKey = ref(0)

// 修改 handleMailSubmit 函数
const handleMailSubmit = async () => {
    const response = await verifyEmail()
    if (response.code === 200) {
        notification.success({
            message: '验证邮件已发送',
            description: '请查收您的邮箱',
            duration: 2,
        })
    } else if (response.code === 400 && response.detail) {
        notification.error({
            message: response.detail,
            description: '请重试',
            duration: 2,
        })
        captchaKey.value += 1
    } else if (response.code === 409) {
        notification.error({
            message: '邮箱已存在',
            description: '请使用其他邮箱',
            duration: 2,
        })
    }
    captchaKey.value++
    site_key.value = ''
}
</script>

<template>
    <h2>注册</h2>
    <a-form
        ref="regFormRef"
        :model="RegForm"
        :rules="RegRules"
        v-if="RegToken.token"
    >
        <p :style="VerifyEmail.style">{{ VerifyEmail.detail }}</p>

        <a-form-item name="avatar" label="头像">
            <a-upload
                name="avatar"
                accept="image/*"
                list-type="picture-card"
                :show-upload-list="false"
                :before-upload="beforeUpload"
                :supportServerRender="true"
                @change="handleChange"
            >
                <img
                    v-if="RegForm.avatar"
                    :src="previewUrl"
                    alt="avatar"
                    style="width: 100%"
                />
                <div v-else>
                    <plus-outlined />
                    <div class="ant-upload-text">Upload</div>
                </div>
            </a-upload>
        </a-form-item>

        <a-form-item name="display_name" label="昵称">
            <a-input
                v-model:value="RegForm.display_name"
                @keydown.enter.prevent
                placeholder="你の名字"
            />
        </a-form-item>

        <a-form-item name="f_password" label="密码">
            <a-input
                type="password"
                v-model:value="RegForm.f_password"
                placeholder="输入绚丽的密码"
            />
        </a-form-item>

        <a-form-item name="s_password" label="确认密码">
            <a-input
                type="password"
                v-model:value="RegForm.s_password"
                placeholder="再输入一次绚丽的密码"
            />
        </a-form-item>

        <a-row :gutter="[0, 24]">
            <a-col :span="24">
                <div class="form-actions">
                    <hCaptcha
                        v-if="data"
                        v-model="site_key"
                        @loaded="isLoaded"
                        :siteKey="data.hcaptcha_sitekey"
                        action="submit"
                        :key="captchaKey"
                        @execute="handleRegSubmit"
                    >
                        <a-button type="primary">注册</a-button>
                    </hCaptcha>
                </div>
            </a-col>
        </a-row>
    </a-form>

    <a-form :model="form" :rules="rules" v-else>
        <a-form-item path="email" label="邮箱">
            <a-auto-complete
                v-model:value="form.email"
                placeholder="输入尊贵的邮箱"
                :input-props="{
                    autocomplete: 'disabled',
                }"
                :options="options"
                allow-clear
            />
        </a-form-item>

        <a-row :gutter="[0, 24]">
            <a-col :span="24">
                <div class="form-actions">
                    <hCaptcha
                        v-if="data"
                        v-model="site_key"
                        @loaded="isLoaded"
                        :siteKey="data.hcaptcha_sitekey"
                        action="submit"
                        :key="captchaKey"
                        @execute="handleMailSubmit"
                    >
                        <a-button type="primary">验证并继续</a-button>
                    </hCaptcha>
                </div>
            </a-col>
        </a-row>
    </a-form>

    <!-- 修复2: 优化Cropper模态框显示 -->
    <a-modal
        v-model:open="showCropper"
        :maskClosable="false"
        preset="card"
        style="width: 400px"
        title="图片裁切"
        @ok="confirmCrop"
        @cancel="clearUploadList"
    >
        <vue-cropper
            ref="cropper"
            :img="previewUrl"
            :full="true"
            :autoCrop="true"
            :fixed="true"
            :infoTrue="true"
            :fixedNumber="[1, 1]"
            :centerBox="true"
            style="height: 400px; width: 100%"
        />
        <template #footer>
            <a-space justify="end">
                <a-button @click="clearUploadList">取消</a-button>
                <a-button type="primary" @click="confirmCrop">确认</a-button>
            </a-space>
        </template>
    </a-modal>
</template>

<style scoped>
.form-actions {
    display: flex;
    justify-content: flex-end;
    width: 100%;
}
</style>
