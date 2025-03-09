<script setup lang="ts">
import { ref, onBeforeUnmount, onMounted, nextTick } from 'vue'
import { ServerAPI } from '../../hooks/api'
import { useRequest } from 'alova/client'
import reCaptcha from '../../components/Recaptcha/ReCaptchaV3.vue'
import type {
    SiteKey,
    Login,
    ReturnResponse,
    ReturnResponse_Register,
} from '../../hooks/type_models'
import type {
    FormItemRule,
    NotificationType,
    UploadCustomRequestOptions,
} from 'naive-ui'
import { createDiscreteApi } from 'naive-ui'
import { VueCropper } from 'vue-cropper'
import 'vue-cropper/dist/index.css'
import type { UploadInst } from 'naive-ui'
import type { FormInst } from 'naive-ui'
import { computed } from 'vue'

const { notification } = createDiscreteApi(['notification'])
const options = computed(() => {
    const prefix = form.value.email.split('@')[0]
    const suffixes = ['@gmail.com', '@163.com', '@qq.com']
    return suffixes.map((suffix) => ({
        label: prefix + suffix,
        value: prefix + suffix,
    }))
})
// 在组件逻辑中添加
const regFormRef = ref<FormInst | null>(null)
const uploadRef = ref<UploadInst | null>(null)
const previewUrl = ref('')
const showCropper = ref(false)
const cropper = ref<InstanceType<typeof VueCropper>>()
const uploadFile = ref<File>()

onBeforeUnmount(() => {
    if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value)
    }
})
const handleFileChange = (options: UploadCustomRequestOptions) => {
    const file = options.file.file
    if (!file || !file.type.startsWith('image/')) {
        Notify({
            type: 'error',
            content: '文件格式错误',
            meta: '请选择图片文件',
            duration: 2000,
        })
        clearUploadList()
        return
    }

    if (file.size > 2 * 1024 * 1024) {
        Notify({
            type: 'error',
            content: '文件过大',
            meta: '请选择小于 2MB 的图片',
            duration: 2000,
        })
        clearUploadList()
        return
    }

    previewUrl.value = URL.createObjectURL(file)
    uploadFile.value = file
    showCropper.value = true
    nextTick(() => {
        if (cropper.value) {
            cropper.value.src = previewUrl.value
            cropper.value.refresh() // 强制刷新裁剪器
        }
    })
}
const confirmCrop = () => {
    cropper.value?.getCropBlob((blob: Blob) => {
        if (blob) {
            // 保留原始文件扩展名和类型
            const ext = uploadFile.value?.name.split('.').pop() || 'png'
            const newFile = new File([blob], `avatar.${ext}`, {
                type: blob.type, // 保持原始MIME类型
            })
            previewUrl.value = URL.createObjectURL(newFile)
            RegForm.value.avatar = newFile
            showCropper.value = false
        }
    })
}
const clearUploadList = () => {
    showCropper.value = false
    uploadRef.value?.clear()
}

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

const RegToken = defineProps<{ token?: string }>()

// 表单相关逻辑
const form = ref({ email: '' })
const rules = {
    email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
}

// reCAPTCHA逻辑
const isLoaded = ref(false)
const site_key = ref('')
const { data } = useRequest(ServerAPI.Get<SiteKey>('/v1/reCAPTCHA_site_key'), {
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
    (token: string) => ServerAPI.Post<ReturnResponse>(`/v1/verify/${token}`),
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
                Notify({
                    type: 'success',
                    content: '邮箱验证通过',
                    meta: '邮箱验证成功,请填写详细信息',
                    duration: 2000,
                })
            } else {
                VerifyEmail.value.detail = `〒▽〒 ${response.detail}`
                VerifyEmail.value.style.color = 'red'
                Notify({
                    type: 'error',
                    content: '邮箱验证失败',
                    meta: '请检查邮箱验证链接是否正确',
                    duration: 2000,
                })
            }
        } catch (error) {
            Notify({
                type: 'error',
                content: '验证失败',
                meta: '',
                duration: 2000,
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
const RegRules = {
    display_name: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
    ],
    f_password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
    s_password: [
        {
            validator(rule: FormItemRule, value: string) {
                if (!value) return new Error('请再次输入密码')
                if (RegForm.value.f_password !== value)
                    return new Error('两次输入的密码不一致')
                return true
            },
            trigger: 'blur',
            required: true,
        },
    ],
    avatar: [
        {
            validator: (rule: FormItemRule, value: File | undefined) => {
                if (!value) {
                    return new Error('请上传头像')
                }
                return true
            },
            trigger: 'change',
        },
    ],
}

const { send: registerUser } = useRequest(
    (formData: FormData) =>
        ServerAPI.Post<ReturnResponse_Register>('/v1/register', formData),
    { immediate: false },
)

const handleRegSubmit = async () => {
    try {
        await regFormRef.value?.validate()
    } catch (error) {
        Notify({
            type: 'error',
            content: '表单验证失败',
            meta: '请检查表单是否填写正确',
            duration: 2000,
        })
        return
    }

    // 如果验证通过，继续注册逻辑
    if (!VerifyEmail.value.regstatus) {
        Notify({
            type: 'error',
            content: '邮箱未验证',
            meta: '请先验证邮箱',
            duration: 2000,
        })
        return
    }

    const formData = new FormData()
    if (!RegForm.value.avatar) {
        Notify({
            type: 'error',
            content: '头像未上传',
            meta: '请上传头像',
            duration: 2000,
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
        Notify({
            type: 'success',
            content: '已成功注册！',
            meta: '请用新的账户密码登录网站',
            duration: 2000,
        })
    }
    if (response.code === 400) {
        Notify({
            type: 'error',
            content: '请求参数错误',
            meta: response.detail,
            duration: 2000,
        })
    } else if (response.code === 422) {
        Notify({
            type: 'error',
            content: 'reCAPTCHA 验证失败',
            meta: response.detail,
            duration: 2000,
        })
        captchaKey.value += 1
    } else if (response.code === 404) {
        Notify({
            type: 'error',
            content: 'Token 未找到或已过期',
            meta: response.detail,
            duration: 2000,
        })
    } else if (response.code === 409) {
        Notify({
            type: 'error',
            content: 'Token 未验证',
            meta: response.detail,
            duration: 2000,
        })
    } else if (response.code === 500) {
        Notify({
            type: 'error',
            content: '服务器内部错误',
            meta: response.detail,
            duration: 2000,
        })
    }
    captchaKey.value++
    site_key.value = ''
}

// 邮箱验证请求处理
const { send: verifyEmail } = useRequest(
    () =>
        ServerAPI.Post<Login>('/v1/verifyemail', {
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
        Notify({
            type: 'success',
            content: '验证邮件已发送',
            meta: '请查收您的邮箱',
            duration: 2000,
        })
    } else if (response.code === 400 && response.detail) {
        Notify({
            type: 'error',
            content: response.detail,
            meta: '请重试',
            duration: 2000,
        })
        captchaKey.value += 1
    } else if (response.code === 409) {
        Notify({
            type: 'error',
            content: '邮箱已存在',
            meta: '请使用其他邮箱',
            duration: 2000,
        })
    }
    captchaKey.value++
    site_key.value = ''
}
</script>

<template>
    <h2>注册</h2>
    <n-form
        ref="regFormRef"
        :model="RegForm"
        :rules="RegRules"
        v-if="RegToken.token"
    >
        <p :style="VerifyEmail.style">{{ VerifyEmail.detail }}</p>

        <n-form-item path="display_name" label="昵称">
            <n-input
                v-model:value="RegForm.display_name"
                @keydown.enter.prevent
                placeholder="你の名字"
            />
        </n-form-item>

        <n-form-item path="f_password" label="密码">
            <n-input
                type="password"
                v-model:value="RegForm.f_password"
                placeholder="输入绚丽的密码"
            />
        </n-form-item>

        <n-form-item path="s_password" label="确认密码">
            <n-input
                type="password"
                v-model:value="RegForm.s_password"
                placeholder="再输入一次绚丽的密码"
            />
        </n-form-item>

        <n-form-item path="avatar" label="头像">
            <n-upload
                ref="uploadRef"
                accept="image/*"
                :show-file-list="false"
                :custom-request="handleFileChange"
            >
                <div v-if="RegForm.avatar" class="preview-container">
                    <n-image width="100" :src="previewUrl" preview-disabled />
                </div>
                <n-button v-else>选择头像文件</n-button>
            </n-upload>
        </n-form-item>

        <n-row :gutter="[0, 24]">
            <n-col :span="24">
                <div class="form-actions">
                    <reCaptcha
                        v-if="data"
                        v-model="site_key"
                        @loaded="isLoaded"
                        :siteKey="data.recapcha_sitekey"
                        action="submit"
                        :key="captchaKey"
                    >
                        <n-button
                            type="primary"
                            :disabled="!site_key"
                            @click="handleRegSubmit"
                        >
                            注册
                        </n-button>
                    </reCaptcha>
                </div>
            </n-col>
        </n-row>
    </n-form>

    <n-form :model="form" :rules="rules" v-else>
        <n-form-item path="email" label="邮箱">
            <n-auto-complete
                v-model:value="form.email"
                placeholder="输入尊贵的邮箱"
                :input-props="{
                    autocomplete: 'disabled',
                }"
                :options="options"
                clearable
            />
        </n-form-item>

        <n-row :gutter="[0, 24]">
            <n-col :span="24">
                <div class="form-actions">
                    <reCaptcha
                        v-if="data"
                        v-model="site_key"
                        @loaded="isLoaded"
                        :siteKey="data.recapcha_sitekey"
                        action="submit"
                        :key="captchaKey"
                    >
                        <n-button
                            type="primary"
                            :disabled="!site_key"
                            @click="handleMailSubmit"
                        >
                            验证并继续
                        </n-button>
                    </reCaptcha>
                </div>
            </n-col>
        </n-row>
    </n-form>

    <!-- 修复2: 优化Cropper模态框显示 -->
    <n-modal
        v-model:show="showCropper"
        :mask-closable="false"
        preset="card"
        style="width: 400px"
        title="图片裁切"
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
            <n-space justify="end">
                <n-button @click="clearUploadList">取消</n-button>
                <n-button type="primary" @click="confirmCrop">确认</n-button>
            </n-space>
        </template>
    </n-modal>
</template>

<style scoped>
.preview-container {
    margin-top: 12px;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    width: 100%;
}
</style>
