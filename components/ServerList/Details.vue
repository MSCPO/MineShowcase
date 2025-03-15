<script setup lang="ts">
import { ServerAPI_Token } from '../../hooks/api'
import { MdPreview } from 'md-editor-v3'
import { useRequest } from 'alova/client'
import type { ServerManagers, Status } from '../../hooks/type_models'
import IMG_noicon from '../../assets/noicon.svg'
const { data: managers } = useRequest(
    () =>
        ServerAPI_Token.Get<ServerManagers>(`/v1/servers/${serverId}/managers`),
    { immediate: true },
)
const route = useRoute()
const serverId = route.params.id
const { data: server, loading } = useRequest(
    () =>
        ServerAPI_Token.Get<Status>(`/v1/servers/info/${serverId}`, {
            cacheFor: null,
        }),
    {
        immediate: true,
    },
)
type ResultStatus = {
    type:
        | 'error'
        | '404'
        | '403'
        | '500'
        | 'success'
        | 'warning'
        | 'info'
        | '418'
    title: string
    description: string
}
const resultStatus = computed<ResultStatus>(() => {
    if (!server.value) return { type: '404', title: '', description: '' }

    switch (server.value.code) {
        case 404:
            return {
                type: '404',
                title: '服务器未找到',
                description: '请检查服务器ID是否正确',
            }
        case 403:
            return {
                type: '403',
                title: '无访问权限',
                description: '该服务器设置了访问限制',
            }
        case 500:
            return {
                type: '500',
                title: '服务器错误',
                description: '服务端发生未知错误',
            }
        default:
            return {
                type: 'error',
                title: '发生错误',
                description: server.value.detail || '未知错误',
            }
    }
})

// 状态颜色
const statusColor = computed(() => {
    if (!server.value?.status) return 'error'
    return server.value.status.delay < 100 ? 'success' : 'warning'
})

// 格式化延迟显示
const formatDelay = (delay?: number) => {
    if (!delay) return 'N/A'
    if (delay < 1) return '<1ms'
    return `${delay.toFixed(2)}ms`
}
</script>

<template>
    <div class="detail">
        <a-spin tip="加载中..." :spinning="loading">
            <div v-if="server" class="server-detail">
                <template v-if="server.code === 200">
                    <!-- 头部信息 -->
                    <div class="server-header">
                        <a-avatar
                            class="a-img"
                            round
                            :size="120"
                            :src="server.status?.icon ?? IMG_noicon"
                        />
                        <div class="header-info">
                            <div class="header-left">
                                <h1 class="server-name">
                                    {{ server.name }}
                                </h1>
                                <a-space align="center">
                                    <a-tag
                                        :bordered="false"
                                        :type="statusColor"
                                    >
                                        {{ server.status ? '在线' : '离线' }}
                                    </a-tag>
                                    <span class="server-ip">
                                        {{ server.ip || 'IP 未公开' }}
                                    </span>
                                </a-space>
                            </div>
                            <NuxtLink
                                v-if="server.permission !== 'guest'"
                                :to="`/editor/${serverId}`"
                            >
                                <a-button type="primary">编辑服务器</a-button>
                            </NuxtLink>
                        </div>
                    </div>

                    <!-- 关键指标 -->
                    <a-grid x-gap="24" y-gap="24" cols="2 s:3 m:4">
                        <a-col>
                            <a-statistic label="在线玩家">
                                {{ server.status?.players.online ?? '-' }}/{{
                                    server.status?.players.max ?? '-'
                                }}
                            </a-statistic>
                        </a-col>
                        <a-col>
                            <a-statistic label="延迟">
                                {{ formatDelay(server.status?.delay) }}
                            </a-statistic>
                        </a-col>
                        <a-col>
                            <a-statistic label="版本">
                                {{ server.version }}
                            </a-statistic>
                        </a-col>
                        <a-col>
                            <a-statistic label="认证模式">
                                {{ server.auth_mode }}
                            </a-statistic>
                        </a-col>
                    </a-grid>

                    <!-- 标签 -->
                    <div class="tag-section">
                        <a-tag
                            v-for="tag in server.tags"
                            :key="tag"
                            bordered
                            round
                        >
                            {{ tag }}
                        </a-tag>
                    </div>

                    <!-- 描述和MOTD -->
                    <a-card title="服务器描述" class="description-card">
                        <MdPreview
                            editor-id="preview-only"
                            :modelValue="server.desc"
                            class="markdown-content"
                        />

                        <template v-if="server.status?.motd" #footer>
                            <div class="motd-section">
                                <h3>MOTD</h3>
                                <pre class="motd-text">{{
                                    server.status.motd.plain
                                }}</pre>
                            </div>
                        </template>
                    </a-card>
                    <a-card class="info-card">
                        <!-- 所有者部分 -->
                        <div v-if="managers?.owners?.length">
                            <h3 class="section-title">所有者</h3>
                            <a-space>
                                <div
                                    v-for="owner in managers.owners"
                                    :key="owner.id"
                                    class="user-item"
                                >
                                    <a-avatar
                                        :src="owner.avatar_url || IMG_noicon"
                                        round
                                        size="small"
                                    />
                                    <span>
                                        {{ owner.display_name }}
                                    </span>
                                </div>
                            </a-space>
                        </div>

                        <!-- 管理员部分 -->
                        <div v-if="managers?.admins?.length">
                            <h3 class="section-title">管理员</h3>
                            <a-space>
                                <div
                                    v-for="admin in managers.admins"
                                    :key="admin.id"
                                    class="user-item"
                                >
                                    <a-avatar
                                        :src="admin.avatar_url || IMG_noicon"
                                        round
                                        size="small"
                                    />
                                    <span>
                                        {{ admin.display_name }}
                                    </span>
                                </div>
                            </a-space>
                        </div>

                        <!-- 相关链接部分 -->
                        <template v-if="server.link">
                            <h3 class="section-title">相关链接</h3>
                            <a
                                :href="server.link"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="link-url"
                            >
                                {{ server.link }}
                            </a>
                        </template>
                    </a-card>
                </template>
                <a-result
                    v-else
                    class="status-result"
                    :status="resultStatus.type"
                    :title="resultStatus.title"
                    :description="resultStatus.description"
                >
                    <template #footer>
                        <NuxtLink :to="`/`">
                            <a-button type="primary">返回首页</a-button>
                        </NuxtLink>
                    </template>
                </a-result>
            </div>
        </a-spin>
    </div>
</template>

<style scoped lang="less">
@import '../assets/css/variables.less';

.detail {
    padding: 20px;
    display: flex;
    flex-direction: column;

    .status-result {
        margin-top: 20vh;
        max-width: 500px;
        margin-left: auto;
        margin-right: auto;
    }

    .server-detail {
        max-width: 1200px;
        margin: 0 auto;
        padding: 24px;

        .server-header {
            display: flex;
            align-items: center;
            gap: 32px;
            margin-bottom: 40px;

            .a-img {
                background-color: #fefefe;
            }

            .header-info {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                flex: 1;
                gap: 20px;

                .header-left {
                    flex: 1;

                    .server-name {
                        margin: 0 0 12px;
                        font-size: 2.4rem;
                        color: @text-color-light;
                        @media (prefers-color-scheme: dark) {
                            color: @text-color-dark;
                        }
                    }

                    .server-ip {
                        color: @text-color-secondary;
                        @media (prefers-color-scheme: dark) {
                            color: @text-color-secondary-dark;
                        }
                        font-family: monospace;
                    }
                }

                .a-button {
                    flex-shrink: 0;
                }
            }
        }

        .tag-section {
            margin: 24px 0;
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
        }

        .description-card {
            margin-top: 24px;
            color: @text-color-light;
            @media (prefers-color-scheme: dark) {
                color: @text-color-dark;
            }
            .markdown-content {
                font-family: monospace;
                padding: 12px;
                border-radius: 6px;
                background-color: @border-color-secondary;
                color: @text-color-light;
                @media (prefers-color-scheme: dark) {
                    background-color: @border-color-secondary-dark;
                    color: @text-color-dark;
                    --md-color: @text-color-secondary-dark;
                }
            }
            .motd-section {
                margin-top: 24px;
                padding-top: 24px;
                border-top: 1px solid @border-color-dark;

                h3 {
                    margin: 0 0 12px;
                }

                .motd-text {
                    font-family: monospace;
                    background-color: @border-color-secondary;

                    @media (prefers-color-scheme: dark) {
                        background-color: @border-color-secondary-dark;
                    }
                    padding: 12px;
                    border-radius: 6px;
                    white-space: pre-wrap;
                }
            }
        }
        .info-card {
            margin-top: 16px;

            .section-title {
                font-size: 1.1em;
                color: @text-color-light;
                @media (prefers-color-scheme: dark) {
                    color: @text-color-dark;
                }
            }

            .user-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 4px 8px;
                background-color: @border-color-secondary;
                @media (prefers-color-scheme: dark) {
                    background-color: @border-color-secondary-dark;
                }
                border-radius: 4px;

                span {
                    font-size: 0.9em;
                    color: @text-color-light;
                    @media (prefers-color-scheme: dark) {
                        color: @text-color-dark;
                    }
                }
            }

            .link-url {
                word-break: break-all;

                color: @accent;
                text-decoration: none;
                display: inline-block;
                padding: 4px 0;

                &:hover {
                    text-decoration: underline;
                }
            }
        }
    }
}

@media (max-width: 768px) {
    .server-detail {
        padding: 16px;

        .server-header {
            flex-direction: column;
            text-align: center;

            .header-info {
                flex-direction: column;
                align-items: center;

                .header-left {
                    text-align: center;
                }

                .a-button {
                    width: 100%;
                    margin-top: 12px;
                }
            }

            .server-name {
                font-size: 1.8rem;
            }
        }
    }
}
</style>
