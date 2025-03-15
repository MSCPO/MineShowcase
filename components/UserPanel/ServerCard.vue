<script setup lang="ts">
import { watchEffect, computed } from 'vue'
import { ServerAPI_Token } from '../../hooks/api'
import type { StatusWithUser } from '../../hooks/type_models'
import { useRequest } from 'alova/client'

const router = useRouter()
const props = defineProps<{
    serverId: number
}>()

// 使用 useRequest 获取服务器详情
const {
    data: serverData,
    loading,
    error,
    send: fetchServer,
} = useRequest(
    () =>
        ServerAPI_Token.Get<StatusWithUser>(
            `/v1/servers/${props.serverId}/editor`,
            { cacheFor: null },
        ),
    {
        immediate: false,
        initialData: {
            code: 0,
            name: '加载中...',
            desc: '',
            type: 'JAVA',
            ip: null,
            status: null, // 初始状态为 null
        } as unknown as StatusWithUser,
    },
)

// 监听 serverId 变化，自动发起请求
watchEffect(() => {
    if (props.serverId) {
        fetchServer()
    }
})

// 简介字数限制
const truncateText = (text: string, maxLength = 50) => {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
}

// 点击管理按钮
const handleManage = () => {
    router.push(`/details/${props.serverId}`)
}

// 判断服务器是否在线
const isOnline = computed(() => {
    return serverData.value?.status !== null
})

import {
    CheckmarkCircleOutline, // 在线图标
    AlertCircleOutline, // 离线图标
    CloseCircleOutline, // 错误图标
} from '@vicons/ionicons5'

// 修改在线状态计算属性
const onlineStatusTag = computed(() => {
    if (error.value)
        return {
            text: '连接错误',
            type: 'error' as 'success' | 'error' | 'warning',
            icon: CloseCircleOutline,
            statusClass: 'error-pulse',
        }

    return isOnline.value
        ? {
              text: `在线（${serverData.value?.status?.players.online || 0}人在线）`,
              type: 'success' as 'success' | 'error' | 'warning',
              icon: CheckmarkCircleOutline,
              statusClass: 'online-pulse',
          }
        : {
              text: '离线',
              type: 'warning' as 'success' | 'error' | 'warning',
              icon: AlertCircleOutline,
              statusClass: 'offline',
          }
})
</script>
<template>
    <a-card hoverable>
        <a-spin :show="loading">
            <div class="server-card">
                <!-- 服务器名称和IP -->
                <a-text strong class="server-name">
                    {{ serverData?.name || `服务器 ${serverId}` }}
                    <a-tag v-if="serverData?.ip" size="small" :bordered="false">
                        {{ serverData.ip }}
                    </a-tag>
                </a-text>

                <div class="status-indicator">
                    <a-tag
                        :type="onlineStatusTag.type"
                        size="small"
                        :bordered="false"
                        class="status-tag"
                    >
                        <template #icon>
                            <n-icon :component="onlineStatusTag.icon" />
                        </template>
                        {{ onlineStatusTag.text }}
                    </a-tag>
                    <div
                        class="status-dot"
                        :class="onlineStatusTag.statusClass"
                    />
                </div>
                <!-- 服务器类型 -->
                <a-text depth="2" class="server-type">
                    类型：{{ serverData?.type || '未知' }}
                </a-text>
                <!-- 服务器简介 -->
                <a-text depth="3" class="server-desc">
                    {{ truncateText(serverData?.desc || '暂无简介') }}
                </a-text>
                <!-- 操作按钮 -->
                <a-space justify="end">
                    <a-button
                        size="small"
                        :disabled="!serverData"
                        @click="handleManage"
                    >
                        查看
                    </a-button>
                </a-space>
            </div>
        </a-spin>
    </a-card>
</template>

<style scoped>
.server-card {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 120px;
}

.server-name {
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    gap: 8px;
}

.server-type {
    font-size: 0.9rem;
}
.status-indicator {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

/* 标签样式 */
.status-tag {
    border-radius: 6px;
    transition: all 0.3s ease;
    padding-right: 8px;

    /* 图标样式 */
    :deep(.n-icon) {
        margin-right: 4px;
        font-size: 14px;
        position: relative;
        top: 1px;
    }
}

/* 状态点动画 */
.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    position: relative;

    &::after {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        animation: pulse 1.5s infinite;
    }
}

/* 在线状态 */
.online-pulse {
    background: #19be6b;

    &::after {
        background: rgba(25, 190, 107, 0.3);
    }
}

/* 离线状态 */
.offline {
    background: #ff9900;
}

/* 错误状态 */
.error-pulse {
    background: #ed4014;

    &::after {
        background: rgba(237, 64, 20, 0.3);
    }
}

@keyframes pulse {
    0% {
        transform: scale(1);
        opacity: 1;
    }
    100% {
        transform: scale(2.5);
        opacity: 0;
    }
}

.server-desc {
    flex: 1;
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.a-card-footer {
    padding-top: 12px;
    border-top: 1px solid var(--a-border-color);
}
</style>
