<script setup lang="ts">
import { shallowRef, ref, onMounted, onBeforeUnmount } from 'vue'
const recommendations = shallowRef([
    { label: 'XXX', value: 1, ping: 0 },
    { label: 'XXX', value: 2, ping: 0 },
    { label: 'XXX', value: 3, ping: 0 },
])

const stats = shallowRef({
    onlinePlayers: 0,
    newServers24h: 0,
})

const lastUpdated = ref(Date.now())
const playerRange = ref<[number, number]>([0, 500])
let intervalId: ReturnType<typeof setInterval> | null = null

onMounted(() => {
    intervalId = setInterval(() => {
        lastUpdated.value = Date.now()
    }, 60000)
})

onBeforeUnmount(() => {
    if (intervalId) clearInterval(intervalId)
})
const filters = ref({
    modes: ['XXX', 'XXX', 'XXX', 'XXX'],
    tags: ['XXX', 'XXX', 'XXX', 'XXX'],
})
</script>

<template>
    <div class="content-wrapper">
        <!-- 为您推荐 -->
        <a-card class="section recommend-section">
            <template #title>
                <div class="card-title" role="heading">为您推荐</div>
            </template>
            <a-space direction="vertical">
                <div
                    v-for="server in recommendations"
                    :key="server.value"
                    class="server-item"
                >
                    <a-tag
                        :bordered="false"
                        type="success"
                        size="small"
                    >
                        {{ server.ping }}ms
                    </a-tag>
                    <span class="server-name">{{ server.label }}</span>
                </div>
            </a-space>
        </a-card>

        <!-- 全站状态 -->
        <a-card class="section stats-section">
            <template #title>
                <div class="card-title" role="heading">全站状态</div>
            </template>
            <a-space direction="vertical">
                <a-statistic title="在线玩家" :value="stats.onlinePlayers" />
                <a-statistic title="24小时新服" :value="stats.newServers24h" />
                <p> 更新时间 </p>
            </a-space>
        </a-card>

        <!-- 精准筛选 -->
        <a-card class="section filter-section">
            <template #title>
                <div class="card-title" role="heading">精准筛选</div>
            </template>
            <a-space direction="vertical">
                <div class="custom-sider">
                    <!-- 游戏模式筛选 -->
                    <a-select
                        :options="
                            filters.modes.map((m) => ({ label: m, value: m }))
                        "
                        multiple
                        placeholder="游戏模式"
                        label="选择游戏模式"
                    />

                    <!-- 玩家数量范围筛选 -->
                    <a-slider
                        :step="10"
                        v-model:value="playerRange"
                        range
                        :tip-formatter="(v: number) => `${v}+ 玩家`"
                    />

                    <!-- 标签筛选 -->
                    <div class="tag-cloud">
                        <a-tag
                            v-for="tag in filters.tags"
                            :key="tag"
                            round
                            size="small"
                        >
                            {{ tag }}
                        </a-tag>
                    </div>
                </div>
            </a-space>
        </a-card>
    </div>
</template>

<style scoped lang="less">
@import '../assets/css/variables.less';

.content-wrapper {
    padding: 12px;
}
.section {
    width: 100%;
    border-radius: 8px;
    background-color: #fff;
    @media (prefers-color-scheme: dark) {
        background-color: @border-color-dark;
    }
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;

    .card-title {
        font-weight: bold;
        font-size: 16px;
        color: @text-color-light;
        @media (prefers-color-scheme: dark) {
            color: @text-color-dark;
        }
        padding: 5px 0;
    }
}
.recommend-section {
    .server-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 0;
        font-size: 14px;
        color: @text-color-light;
        @media (prefers-color-scheme: dark) {
            color: @text-color-dark;
        }
        .server-name {
            font-weight: 500;
            font-size: 14px;
        }
    }
}

.stats-section {
    .a-statistic {
        margin-bottom: 16px;

        &:last-child {
            margin-bottom: 0;
        }
    }

    .time-display {
        font-size: 14px;
        color: #595959;
        margin-top: 8px;
    }
}

.filter-section {
    .a-select,
    .a-slider {
        width: 100%;
        margin-bottom: 16px;
    }

    .tag-cloud {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        padding: 8px 0;
    }

    .a-tag {
        margin: 2px;
    }
}
</style>
