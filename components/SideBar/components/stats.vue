<script setup lang="ts">
import { shallowRef, ref, onMounted, onUnmounted } from 'vue'
import Time from '../../Common/Time/Time.vue'
import { ServerAPI } from '@/api'
import type { List } from '@/api/models'

const stats = shallowRef({
    onlinePlayers: 0,
    newServers24h: 0,
})

const loading = ref(false)

// 获取全站统计数据
const fetchStats = async () => {
    try {
        loading.value = true
        // 获取服务器列表
        const response = await ServerAPI.Get<List>('/v1/servers', {})

        // 计算在线玩家总数
        let totalOnlinePlayers = 0
        const now = new Date()
        let newServersCount = 0

        response.server_list.forEach(server => {
            // 累加在线玩家数
            if (server.status && server.status.players) {
                totalOnlinePlayers += server.status.players.online || 0
            }

            // 计算24小时内新增服务器数
            if (server.create_time) {
                const createTime = new Date(server.create_time)
                const timeDiff = now.getTime() - createTime.getTime()
                const hoursDiff = timeDiff / (1000 * 60 * 60)

                if (hoursDiff <= 24) {
                    newServersCount++
                }
            }
        })

        // 更新统计数据
        stats.value = {
            onlinePlayers: totalOnlinePlayers,
            newServers24h: newServersCount
        }
    } catch (error) {
        console.error('获取统计数据失败:', error)
    } finally {
        loading.value = false
    }
}

// 组件挂载时获取数据
onMounted(() => {
    fetchStats()

    // 设置定时器，每分钟更新一次数据
    const timer = setInterval(fetchStats, 60000)

    // 组件卸载时清除定时器
    onUnmounted(() => {
        clearInterval(timer)
    })
})
</script>

1<template>
    <!-- 全站统计 -->
    <a-card title="全站统计" class="section stats-section">
        <template #extra>
            <a-spin :spinning="loading" size="small" />
        </template>
        <a-space direction="vertical" style="width: 100%">
            <div class="stat-item">
                <span class="stat-label">在线玩家</span>
                <span class="stat-value" :class="{ 'pulse': stats.onlinePlayers > 0 }">
                    {{ stats.onlinePlayers.toLocaleString() }}
                </span>
            </div>
            <div class="stat-item">
                <span class="stat-label">24小时新增服务器</span>
                <span class="stat-value" :class="{ 'pulse': stats.newServers24h > 0 }">
                    {{ stats.newServers24h }}
                </span>
            </div>
            <div class="stat-item">
                <span class="stat-value">
                    <Time />
                </span>
            </div>
        </a-space>
    </a-card>
</template>

<style scoped lang="less">
@import '@/assets/css/variables.less';

.stats-section {
    .stat-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 8px;
        border-radius: 6px;
        margin-bottom: 12px;
        transition: all 0.3s ease;
        background-color: rgba(0, 0, 0, 0.02);

        @media (prefers-color-scheme: dark) {
            background-color: rgba(255, 255, 255, 0.05);
        }

        &:hover {
            background-color: rgba(0, 0, 0, 0.04);
            transform: translateY(-2px);

            @media (prefers-color-scheme: dark) {
                background-color: rgba(255, 255, 255, 0.08);
            }
        }

        &:last-child {
            margin-bottom: 0;
        }

        .stat-label {
            font-weight: 500;
            color: @text-color-secondary;
            font-size: 14px;

            @media (prefers-color-scheme: dark) {
                color: @text-color-secondary-dark;
            }
        }

        .stat-value {
            font-weight: 600;
            font-size: 12px;
            color: @text-color-light;

            @media (prefers-color-scheme: dark) {
                color: @text-color-dark;
            }

            &.pulse {
                animation: pulse 1.5s ease-in-out;
            }
        }

        @media (max-width: 768px) {
            padding: 10px 6px;
            margin-bottom: 8px;
        }
    }

    @keyframes pulse {
        0% {
            transform: scale(1);
        }

        50% {
            transform: scale(1.05);
            color: @primary-light;
        }

        100% {
            transform: scale(1);
        }
    }
}
</style>
