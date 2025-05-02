<script setup lang="ts">
import { shallowRef, ref, onMounted, onUnmounted } from 'vue'
import { ServerAPI } from '@/api'
import type { List, Server } from '@/api/models'

interface RecommendServer {
    label: string;
    value: number;
    ping: number;
    id: string;
}

const recommendations = shallowRef<RecommendServer[]>([])
const loading = ref(false)

// 获取推荐服务器
const fetchRecommendations = async () => {
    try {
        loading.value = true
        // 获取服务器列表
        const response = await ServerAPI.Get<List>('/v1/servers', {})

        // 筛选有效的服务器（延迟大于0ms就认为在线）
        const validServers = response.server_list.filter(server =>
            server.status &&
            server.status.delay !== undefined &&
            server.status.delay > 0
        )

        // 分离成员服务器和非成员服务器
        const memberServers = validServers.filter(server => server.is_member)
        const nonMemberServers = validServers.filter(server => !server.is_member)

        // 随机打乱数组顺序
        const shuffleMemberServers = [...memberServers].sort(() => Math.random() - 0.5)
        const shuffleNonMemberServers = [...nonMemberServers].sort(() => Math.random() - 0.5)

        // 优先选择成员服务器，如果不足再选择非成员服务器
        let selectedServers = [...shuffleMemberServers]

        // 如果成员服务器不足3个，添加非成员服务器
        if (selectedServers.length < 3) {
            selectedServers = selectedServers.concat(shuffleNonMemberServers.slice(0, 3 - selectedServers.length))
        } else {
            // 如果成员服务器超过3个，只取前3个
            selectedServers = selectedServers.slice(0, 3)
        }

        // 转换为推荐格式
        const topRecommendations = selectedServers.map((server, index) => ({
            label: server.name || '未命名服务器',
            value: index + 1,
            ping: Math.round(server.status?.delay || 0),
            id: server.id
        }))

        // 如果没有足够的推荐，填充一些默认值
        while (topRecommendations.length < 3) {
            topRecommendations.push({
                label: '暂无推荐',
                value: topRecommendations.length + 1,
                ping: 0,
                id: ''
            })
        }

        recommendations.value = topRecommendations
    } catch (error) {
        console.error('获取推荐服务器失败:', error)
        // 设置默认值
        recommendations.value = [
            { label: '暂无推荐', value: 1, ping: 0, id: '' },
            { label: '暂无推荐', value: 2, ping: 0, id: '' },
            { label: '暂无推荐', value: 3, ping: 0, id: '' },
        ]
    } finally {
        loading.value = false
    }
}

// 组件挂载时获取数据
onMounted(() => {
    fetchRecommendations()

    // 设置定时器，每3分钟更新一次推荐
    const timer = setInterval(fetchRecommendations, 180000)

    // 组件卸载时清除定时器
    onUnmounted(() => {
        clearInterval(timer)
    })
})
</script>

<template>
    <!-- 为您推荐 -->
    <a-card title="为您推荐" class="section recommend-section">
        <template #extra>
            <a-spin :spinning="loading" size="small" />
        </template>
        <a-space direction="vertical" style="width: 100%">
            <div v-for="server in recommendations" :key="server.value" class="server-item"
                :class="{ 'no-recommend': !server.id }" @click="server.id && $router.push(`/server/${server.id}`)">
                <a-tag :bordered="false" :type="server.ping > 0 ? 'success' : 'default'" size="small">
                    {{ server.ping > 0 ? `${server.ping}ms` : '暂无数据' }}
                </a-tag>
                <span class="server-name">{{ server.label }}</span>
            </div>
        </a-space>
    </a-card>
</template>

<style scoped lang="less">
@import '@/assets/css/variables.less';

.recommend-section {
    .server-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 10px 8px;
        font-size: 14px;
        color: @text-color-light;
        border-radius: 6px;
        margin-bottom: 8px;
        transition: all 0.3s ease;
        cursor: pointer;
        background-color: rgba(0, 0, 0, 0.02);
        position: relative;
        overflow: hidden;

        &:hover:not(.no-recommend) {
            background-color: rgba(0, 0, 0, 0.04);
            transform: translateY(-2px);
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);

            @media (prefers-color-scheme: dark) {
                background-color: rgba(255, 255, 255, 0.08);
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
            }

            &::after {
                content: '';
                position: absolute;
                right: 8px;
                top: 50%;
                transform: translateY(-50%);
                width: 16px;
                height: 16px;
                background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23999"><path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"/></svg>');
                background-size: contain;
                opacity: 0.6;
            }
        }

        &.no-recommend {
            cursor: default;
            opacity: 0.6;
            background-color: transparent;
        }

        @media (prefers-color-scheme: dark) {
            color: @text-color-dark;
            background-color: rgba(255, 255, 255, 0.05);

            &.no-recommend {
                background-color: transparent;
            }
        }

        .server-name {
            font-weight: 500;
            font-size: 14px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            flex: 1;
        }

        @media (max-width: 768px) {
            padding: 12px 10px;
            border-radius: 8px;
            margin-bottom: 10px;

            .server-name {
                font-size: 15px;
            }
        }
    }

    /* 确保最后一个项目没有底部边距 */
    .server-item:last-child {
        margin-bottom: 0;
    }
}
</style>
