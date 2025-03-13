<script setup lang="ts">
// import {
//     NAvatar,
//     NCard,
//     NSpace,
//     NSpin,
//     NText,
//     NButton,
//     NResult,
// } from 'naive-ui'
import { useRequest } from 'alova/client'
import { ServerAPI_Token } from '../../hooks/api'
import type { User } from '../../hooks/type_models'
import ServerCard from './ServerCard.vue'
import IMG_noicon from '../../assets/noicon.svg'

const router = useRouter()
const showAdvanced = ref(false)
const toggleAdvanced = () => (showAdvanced.value = !showAdvanced.value)
const token_status = ref(false)

const isUnauthorized = ref(false)

const { error, data, onSuccess, send, loading } = useRequest(
    ServerAPI_Token.Get<User>('/v1/me'),
    {
        immediate: true,
    },
)

onMounted(() => {
    onSuccess(() => {
        if (data.value.code === 401) {
            isUnauthorized.value = true
        }
        if (data.value.code === 200) {
            token_status.value = true
        }
        if (data.value.code === 404) {
            isUnauthorized.value = true
        }
    })
})

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

const goBack = () => router.go(-1)
const gotoLogin = () => router.push('/auth')
</script>

<template>
    <div class="user-panel">
        <n-spin :show="loading">
            <n-result
                v-if="isUnauthorized"
                status="403"
                title="未登录"
                description="需要登录才能查看个人信息"
                size="large"
            >
                <template #footer>
                    <n-space justify="center">
                        <n-button type="primary" @click="gotoLogin">
                            立即登录
                        </n-button>
                        <n-button @click="goBack">返回上一页</n-button>
                    </n-space>
                </template>
            </n-result>
            <n-result
                v-else-if="error"
                status="error"
                title="加载失败"
                description="无法获取用户信息，请检查网络连接"
                size="large"
            >
                <template #footer>
                    <n-space justify="center">
                        <n-button type="primary" @click="send">重试</n-button>
                        <n-button @click="goBack">返回上一页</n-button>
                    </n-space>
                </template>
            </n-result>

            <n-card v-else-if="token_status" hoverable>
                <div class="profile-header">
                    <n-avatar
                        round
                        :size="160"
                        :src="data.avatar_url || IMG_noicon"
                        class="main-avatar"
                    />
                    <div class="header-info">
                        <h1 class="display-name">
                            {{ data.display_name || data.username }}
                        </h1>
                        <n-space align="center">
                            <!-- 计划个性签名，或者创新的给自己贴标签 -->
                        </n-space>
                    </div>
                </div>

                <n-divider />

                <div class="info-grid">
                    <div class="info-item">
                        <label><n-text depth="3">用户ID</n-text></label>
                        <n-text strong>{{ data.id }}</n-text>
                    </div>

                    <div class="info-item">
                        <label><n-text depth="3">注册邮箱</n-text></label>
                        <n-text>{{ data.email }}</n-text>
                    </div>

                    <div class="info-item">
                        <label><n-text depth="3">创建时间</n-text></label>
                        <n-text>
                            {{ formatDate(data.created_at) }}
                        </n-text>
                    </div>

                    <div class="info-item">
                        <label><n-text depth="3">最后登录</n-text></label>
                        <n-text>
                            {{ formatDate(data.last_login) }}
                        </n-text>
                    </div>
                </div>

                <n-collapse-transition :show="showAdvanced">
                    <div class="advanced-info">
                        <n-divider dashed>高级信息</n-divider>
                        <div class="info-grid">
                            <div class="info-item">
                                <label>
                                    <n-text depth="3">登录账号</n-text>
                                </label>
                                <n-text>{{ data.username }}</n-text>
                            </div>
                            <div class="info-item">
                                <label>
                                    <n-text depth="3">账户类型</n-text>
                                </label>
                                <n-text>
                                    {{
                                        data.role === 'admin'
                                            ? '管理员账户'
                                            : '普通账户'
                                    }}
                                </n-text>
                            </div>
                        </div>
                    </div>
                </n-collapse-transition>

                <div class="action-bar">
                    <n-button type="primary" dashed @click="toggleAdvanced">
                        {{ showAdvanced ? '收起详情' : '展开详情' }}
                    </n-button>
                    <!-- <n-button
                        tag="a"
                        href="/settings"
                        type="primary"
                        class="edit-btn"
                    >
                        编辑资料
                    </n-button> -->
                </div>
            </n-card>

            <div class="server-list" v-if="token_status">
                <h2 style="margin: 24px 0 16px">我的服务器</h2>
                <n-empty
                    v-if="data?.servers?.length === 0"
                    description="您还没有任何服务器"
                    style="margin: 32px 0"
                ></n-empty>
                <!-- <template #extra>
                <n-button size="small" @click="router.push('/create')">
                    创建新服务器
                </n-button>
            </template> -->

                <n-grid cols="1 600:2 960:3" x-gap="16" y-gap="16">
                    <n-gi
                        v-for="[role, serverId] in data?.servers || []"
                        :key="serverId"
                    >
                        <ServerCard
                            :server-id="Number(serverId)"
                            :role="role"
                        />
                    </n-gi>
                </n-grid>
            </div>
        </n-spin>
    </div>
</template>

<style scoped lang="less">
@import '../assets/css/variables.less';

.user-panel {
    padding: 20px;
    display: flex;
    flex-direction: column;
    .profile-header {
        display: flex;
        align-items: center;
        gap: 40px;
        padding: 20px 0;

        .main-avatar {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .header-info {
            flex: 1;

            .display-name {
                margin: 0 0 12px;
                font-size: 2.2rem;
                color: @text-color-light;
                @media (prefers-color-scheme: dark) {
                    color: @text-color-dark;
                }
            }
        }
    }

    .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 24px;
        padding: 16px 0;
    }

    .info-item {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 16px;
        background: @border-color-secondary;
        @media (prefers-color-scheme: dark) {
            background: @border-color-secondary-dark;
        }
        border-radius: 8px;
        transition: all 0.3s;

        &:hover {
            background: @hover-primary;
            transform: translateY(-2px);
        }

        label {
            font-size: 0.9rem;
            color: #6b7280;
        }
    }

    .action-bar {
        display: flex;
        justify-content: flex-end;
        gap: 16px;
        margin-top: 32px;
        padding-top: 24px;
        border-top: 1px solid #e5e7eb;

        .edit-btn {
            min-width: 120px;
        }
    }

    @media (max-width: 768px) {
        .profile-header {
            flex-direction: column;
            text-align: center;
            gap: 20px;

            .header-info .display-name {
                font-size: 1.8rem;
            }
        }

        .info-grid {
            grid-template-columns: 1fr;
        }

        .action-bar {
            flex-direction: column;
        }
    }
}
.server-list {
    color: @text-color-light;
    @media (prefers-color-scheme: dark) {
        color: @text-color-dark;
    }
    margin-top: 24px;

    .n-grid {
        margin-bottom: 24px;
    }

    .n-card {
        height: 100%;
        display: flex;
        flex-direction: column;

        &-footer {
            margin-top: auto;
        }
    }
}
.error-message {
    text-align: center;
    padding: 40px 20px;

    .n-space {
        justify-content: center;
        gap: 16px;
    }
}
</style>
