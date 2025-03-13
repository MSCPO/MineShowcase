<script setup lang="ts">
import { ref, watch, onMounted, computed, defineAsyncComponent } from 'vue'
import { ServerAPI } from '../../hooks/api'
import type { List, Server, Status } from '../../hooks/type_models'

const ServerCard = defineAsyncComponent(() => import('./ServerCard.vue'))

const allData = ref<Status[]>([])
const currentPageData = ref<Status[]>([])
const loading = ref(true)
const error = ref<Error | null>(null)
const page = ref(1)
const pageSize = 12
const ServersTotal = ref(0)
const isVisible = ref(false)
const searchQuery = ref('')
interface ServerWithPinyin extends Status {
    pinyin?: string // 全拼
    initials?: string // 拼音首字母
}
const serverDataWithPinyin = ref<ServerWithPinyin[]>([])

const convertToPinyin = async (name: string) => {
    const pinyin = await import('tiny-pinyin')
    const fullPinyin = pinyin.convertToPinyin(name, '', true)
    const initials = pinyin.convertToPinyin(name, '', true).replace(/\s+/g, '')
    return { pinyin: fullPinyin, initials }
}

const initPinyinData = async (data: Status[]) => {
    const promises = data.map(async (server) => {
        const { pinyin, initials } = await convertToPinyin(server.name)
        return { ...server, pinyin, initials }
    })
    return await Promise.all(promises)
}

const filteredData = computed(() => {
    if (!searchQuery.value) return serverDataWithPinyin.value
    const query = searchQuery.value.toLowerCase()
    return serverDataWithPinyin.value.filter((server) => {
        // 若拼音数据还未加载，则仅匹配中文名称
        if (!server.pinyin || !server.initials) {
            return server.name.toLowerCase().includes(query)
        }
        return (
            server.name.toLowerCase().includes(query) ||
            server.pinyin.includes(query) ||
            server.initials.includes(query)
        )
    })
})

const fetchAllData = async () => {
    try {
        loading.value = true
        const response = await ServerAPI.Get<List>('/v1/servers', {})
        allData.value = response.server_list
        serverDataWithPinyin.value = [...allData.value]

        // 异步加载拼音数据，完成后再更新
        initPinyinData(allData.value).then((dataWithPinyin) => {
            serverDataWithPinyin.value = dataWithPinyin
            random()
            updatePageData()
        })
    } catch (err) {
        error.value = err as Error
    } finally {
        loading.value = false
    }
}

const updatePageData = () => {
    isVisible.value = false
    setTimeout(() => {
        const start = (page.value - 1) * pageSize
        const end = start + pageSize
        currentPageData.value = filteredData.value.slice(start, end)
        ServersTotal.value = filteredData.value.length
        isVisible.value = true
    }, 300)
}

// 随机打乱数据
const random = () => {
    // 将服务器数据分组：非 null 状态和 null 状态
    const nonNullStatus = serverDataWithPinyin.value.filter(
        (server) => server.status !== null,
    )
    const nullStatus = serverDataWithPinyin.value.filter(
        (server) => server.status === null,
    )

    // 定义一个数组随机打乱函数（Fisher-Yates 洗牌算法）
    const shuffleArray = (arr: any[]) => {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[arr[i], arr[j]] = [arr[j], arr[i]]
        }
    }

    // 分别随机打乱两部分数据
    shuffleArray(nonNullStatus)
    shuffleArray(nullStatus)

    // 合并数据，保证 nonNullStatus 的数据排在前面
    serverDataWithPinyin.value = [...nonNullStatus, ...nullStatus]
    updatePageData()
}

// 监听页码和过滤数据变化
watch([page, filteredData], () => {
    updatePageData()
})

onMounted(() => {
    fetchAllData()
})
</script>

<template>
    <div class="ServerList">
        <h1>服务器列表</h1>
        <div v-if="error">加载失败QAQ (code: {{ error.message }})</div>
        <div v-else>
            <!-- 搜索框 -->
            <div class="search-box">
                <a-input
                    v-model:value="searchQuery"
                    placeholder="输入服务器名称、拼音或拼音首字母搜索..."
                    clearable
                    @keyup.enter="page = 1"
                />
            </div>
            <div class="page">
                <a-button @click="random">随机</a-button>
                <a-pagination
                    v-model:current="page"
                    :page-size="pageSize"
                    :total="ServersTotal"
                />
            </div>
            <a-divider />
            <TransitionGroup
                tag="div"
                name="fade"
                class="grid-list"
                ref="serverList"
            >
                <ServerCard
                    v-for="server in currentPageData"
                    v-if="isVisible"
                    :key="server.id"
                    :id="server.id"
                    :name="server.name"
                    :ip="server.ip"
                    :auth_mode="server.auth_mode"
                    :desc="server.desc"
                    :status="server.status"
                    :link="server.link"
                    :tags="server.tags"
                    :type="server.type"
                    :version="server.version"
                    :is_hide="server.is_hide"
                    :is_member="server.is_member"
                    :permission="server.permission"
                    :detail="server.detail"
                />
                <div v-else class="skeleton" style="max-width: 20rem;">
                    <a-skeleton active />
                    <a-skeleton avatar active :paragraph="{ rows: 2 }" />
                </div>
            </TransitionGroup>
            <a-divider />
            <a-pagination
                v-model:current="page"
                :page-size="pageSize"
                :total="ServersTotal"
                v-if="isVisible"
            />
        </div>
    </div>
</template>

<style scoped lang="less">
@import '../assets/css/variables.less';

.ServerList {
    color: @text-color-light;
    @media (prefers-color-scheme: dark) {
        color: @text-color-dark;
    }
    padding: 20px;
}
.search-box {
    margin-bottom: 20px;
    max-width: 300px;
}
.page {
    display: flex;
    gap: 0.4rem;
    align-items: center;
}
.grid-list {
    display: grid;
    box-sizing: border-box;
    grid-template-columns: repeat(auto-fit, minmax(25rem, 1fr));
    gap: 20px;
    will-change: transform, opacity;
    @media screen and (max-width: 768px) {
        grid-template-columns: 1fr;
    }
}

/* 定义卡片进入与离开的动画 */
.fade-enter-active {
    animation: card-enter 0.3s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
}

.fade-leave-active {
    animation: card-leave 0.3s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
}

@keyframes card-enter {
    0% {
        opacity: 0;
        transform: translateY(30px) scale(0.95) rotateX(15deg);
    }
    100% {
        opacity: 1;
        transform: translateY(0) scale(1) rotateX(0deg);
    }
}

@keyframes card-leave {
    0% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
    100% {
        opacity: 0;
        transform: translateY(30px) scale(0.95);
    }
}
</style>
