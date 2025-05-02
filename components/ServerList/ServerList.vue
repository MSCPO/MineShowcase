<script setup lang="ts">
import { ref, watch, onMounted, computed, defineAsyncComponent, inject } from 'vue'
import { ServerAPI } from '~/api'
import type { List, Status } from '~/api/models'

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
const showAllServers = ref(false)

// 筛选条件
const filterOptions = ref({
    playerRange: [0, 500] as [number, number],
    modes: [] as string[],
    authModes: [] as string[],
    tags: [] as string[]
})

interface ServerWithPinyin extends Status {
    pinyin?: string // 全拼
    initials?: string // 拼音首字母
}
const serverDataWithPinyin = ref<ServerWithPinyin[]>([])

// 处理筛选组件发出的筛选事件
const handleFilterChange = (options: any) => {
    filterOptions.value = options
    page.value = 1 // 重置页码
}

// 接收从布局组件提供的筛选条件
const injectedFilterOptions = inject('filterOptions', null)

// 监听注入的筛选选项变化
if (injectedFilterOptions) {
    watch(() => injectedFilterOptions.value, (newOptions) => {
        if (newOptions) {
            filterOptions.value = newOptions
            page.value = 1 // 重置页码
        }
    }, { immediate: true })
}

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
    let result = serverDataWithPinyin.value

    // 先根据搜索查询过滤
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter((server) => {
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
    }

    // 如果不显示所有服务器，则只显示已认证的服务器
    if (!showAllServers.value) {
        result = result.filter((server) => server.is_member === true)
    }

    // 根据筛选条件过滤
    // 1. 游戏版本筛选
    if (filterOptions.value.modes && filterOptions.value.modes.length > 0) {
        result = result.filter(server =>
            filterOptions.value.modes.includes(server.type)
        )
    }

    // 2. 认证模式筛选
    if (filterOptions.value.authModes && filterOptions.value.authModes.length > 0) {
        result = result.filter(server =>
            filterOptions.value.authModes.includes(server.auth_mode)
        )
    }

    // 3. 玩家数量范围筛选
    const [minPlayers, maxPlayers] = filterOptions.value.playerRange
    result = result.filter(server => {
        // 如果服务器状态为空或玩家数为空，则默认为0
        const playerCount = server.status?.players?.online || 0
        return playerCount >= minPlayers && playerCount <= maxPlayers
    })

    // 4. 标签筛选
    if (filterOptions.value.tags && filterOptions.value.tags.length > 0) {
        result = result.filter(server => {
            // 如果服务器没有标签，则不匹配
            if (!server.tags || server.tags.length === 0) return false
            // 只要有一个标签匹配即可
            return server.tags.some(tag => filterOptions.value.tags.includes(tag))
        })
    }

    return result
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

import ServerCardSkeleton from './ServerCardSkeleton.vue'
</script>

<template>
    <div class="ServerList">
        <div class="text">
            <h1>服务器列表</h1>
            <p>搜索服务器，支持名称、拼音、首字母查询，随机推荐与分页浏览。</p>

            <a-input-group class="input-line" compact>
                <a-input class="input" simple v-model:value="searchQuery" placeholder="输入服务器名称、拼音或拼音首字母搜索..."
                    allow-clear @keyup.enter="page = 1">
                    <template #prefix>
                        <SearchOutlined v-if="isVisible" />
                        <LoadingOutlined v-else />
                    </template>
                </a-input>
                <a-button class="input-btn" @click="random" :disabled="!isVisible">
                    随机
                </a-button>
            </a-input-group>

            <div class="filter-options">
                <a-tooltip title="MSCPO 认证服务器更稳定、体验更佳。此选项会显示包括未认证在内的所有服务器" placement="bottom">
                    <a-checkbox v-model:checked="showAllServers" @change="page = 1">
                        显示未认证服务器
                    </a-checkbox>
                </a-tooltip>
            </div>
        </div>
        <a-divider />
        <div v-if="currentPageData.length === 0 && isVisible" class="text">
            <p>这里是一片荒岛...换一个词搜索罢 QAQ</p>
        </div>
        <div v-else-if="error">加载失败 QAQ (code: {{ error.message }})</div>
        <div v-else>
            <TransitionGroup tag="div" name="fade" class="grid-list" ref="serverList" v-if="isVisible">
                <ServerCard v-for="server in currentPageData" :key="server.id" :id="server.id" :name="server.name"
                    :ip="server.ip" :auth_mode="server.auth_mode" :desc="server.desc" :status="server.status"
                    :link="server.link" :tags="server.tags" :type="server.type" :version="server.version"
                    :is_hide="server.is_hide" :is_member="server.is_member" :permission="server.permission"
                    :detail="server.detail" :cover_url="server.cover_url" />
            </TransitionGroup>

            <div v-else class="grid-list">
                <ServerCardSkeleton v-for="n in pageSize" :key="'skeleton-' + n" />
            </div>

            <a-divider />
            <a-pagination v-model:current="page" :page-size="pageSize" :total="ServersTotal" v-if="isVisible" />
        </div>
    </div>
</template>

<style scoped lang="less">
@import '@/assets/css/variables.less';

.ServerList {
    color: @text-color-light;

    @media (prefers-color-scheme: dark) {
        color: @text-color-dark;
    }

    padding: 20px;
}

.text {
    h1 {
        font-weight: normal;
        text-align: center;
    }

    p {
        font-size: 1.2rem;
        text-align: center;
        padding-inline: 2rem;
        color: @text-color-secondary;

        @media (prefers-color-scheme: dark) {
            color: @text-color-secondary-dark;
        }
    }

    .input-line {
        margin: 0 auto;
        max-width: 20rem;

        .input {
            width: 80%;
        }

        .input-btn {
            width: 20%;
        }
    }

    .filter-options {
        margin-top: 0.8rem;
        text-align: center;
    }
}

.page {
    display: flex;
    gap: 0.4rem;
    align-items: center;

    .pagin {
        display: flex;
    }
}

.grid-list {
    display: grid;
    box-sizing: border-box;
    grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
    gap: 20px;
    will-change: transform, opacity;
    justify-content: center;

    @media screen and (max-width: 768px) {
        grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
    }
}

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
