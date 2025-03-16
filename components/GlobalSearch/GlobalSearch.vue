<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDebounceFn, onClickOutside } from '@vueuse/core'
import { ServerAPI } from '../../hooks/api'
import { useRouter } from 'vue-router'

const router = useRouter()
const inputRef = ref(null)
const activeKey = ref(['1'])
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const showResult = ref(false)
const searchLoading = ref(false)
const target = ref(null)

interface SearchResult {
    id: string
    name: string
    // 根据后端返回可扩展其他字段
}

// 搜索功能：debounce 300ms
const performSearch = useDebounceFn(async () => {
    if (!searchQuery.value) {
        searchResults.value = []
        showResult.value = false
        return
    }
    try {
        searchLoading.value = true
        const response = await ServerAPI.Get<{ results: SearchResult[] }>(
            '/v1/search',
            {
                params: {
                    query: searchQuery.value,
                    limit: 5,
                },
            },
        )
        searchResults.value = response.results
        showResult.value = true
    } catch (error) {
        console.error('搜索失败:', error)
        searchResults.value = []
    } finally {
        searchLoading.value = false
    }
}, 300)

onClickOutside(target, () => (showResult.value = false))

const PushRouter = (id: string) => {
    router.push(`/details/${id}`)
    showResult.value = false
}

const serverResults = computed(() => searchResults.value)
const docResults = computed<SearchResult[]>(() => [])
</script>

<template>
    <div ref="target" style="position: relative">
        <a-input
            v-model:value="searchQuery"
            ref="inputRef"
            placeholder="全局搜索"
            @change="performSearch"
            @focus="showResult = true"
        >
            <template #prefix>
                <SearchOutlined />
            </template>
        </a-input>
        <transition name="slide-fade">
            <div class="search-result" v-show="showResult" @click.stop>
                <template v-if="serverResults.length || docResults.length">
                    <a-collapse
                        v-model:activeKey="activeKey"
                        :bordered="false"
                        style="background: rgb(255, 255, 255)"
                    >
                        <a-collapse-panel
                            key="1"
                            header="服务器"
                            v-if="serverResults.length"
                        >
                            <transition-group name="fade" tag="div">
                                <div
                                    class="info-item"
                                    v-for="server in serverResults"
                                    :key="server.id"
                                    @click="PushRouter(server.id)"
                                >
                                    {{ server.name }}
                                </div>
                            </transition-group>
                        </a-collapse-panel>
                        <a-collapse-panel
                            key="2"
                            header="文档"
                            v-if="docResults.length"
                        >
                            <transition-group name="fade" tag="div">
                                <div
                                    class="info-item"
                                    v-for="doc in docResults"
                                    :key="doc.id"
                                    @click="PushRouter(doc.id)"
                                >
                                    {{ doc.name }}
                                </div>
                            </transition-group>
                        </a-collapse-panel>
                    </a-collapse>
                </template>
                <template v-else>
                    <div class="no-result">无结果</div>
                </template>
            </div>
        </transition>
    </div>
</template>

<style scoped lang="less">
@import '../../assets/css/variables.less';

.search-result {
    position: absolute;
    top: 100%;
    background: @background-light;
    border: 1px solid @border-color;
    width: 100%;
    left: 0;
    border-radius: 0.4rem;
    padding: 0.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.no-result {
    text-align: center;
    padding: 1rem;
    color: @text-color-secondary;
}

/* 列表动画 */
.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: all 0.3s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}
.slide-fade-enter-to,
.slide-fade-leave-from {
    opacity: 1;
    transform: translateY(0);
}

/* 条目动画 */
.fade-enter-active,
.fade-leave-active {
    transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(-5px);
}
.fade-enter-to,
.fade-leave-from {
    opacity: 1;
    transform: translateY(0);
}

.info-item {
    display: flex;
    padding: 0.5rem;
    flex-direction: column;
    background: @border-color-secondary;
    @media (prefers-color-scheme: dark) {
        background: @border-color-secondary-dark;
    }
    border-radius: 3px;
    margin-bottom: 0.3rem;
    transition: all 0.3s;
    cursor: pointer;
    &:hover {
        background: @hover-primary;
        transform: translateY(-2px);
    }
}
</style>
