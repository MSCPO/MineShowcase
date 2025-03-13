<script setup lang="ts">
import lang from '../languages/index'
import Logo from '../assets/logo.webp'
import { ref, onMounted, computed, h } from 'vue'
import { ServerAPI, ServerAPI_Token } from '../hooks/api'
import { useRequest } from 'alova/client'
// import {
//     createDiscreteApi,
//     NBadge,
//     NDropdown,
//     NIcon,
//     NInput,
//     type NotificationType,
// } from 'naive-ui'
import {
    Notifications,
    PersonCircleOutline,
    LogOutOutline,
    SearchOutline,
} from '@vicons/ionicons5'
import type { User } from '../hooks/type_models'
import { useDebounceFn, useThrottleFn, useEventListener } from '@vueuse/core'
import { markRaw } from 'vue'

const username = ref('')
const token_status = ref(false)
const showModal = ref(false)
const unreadCount = ref(0)
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const showDropdown = ref(false)
const searchLoading = ref(false)
const avatar_url = ref<string | undefined | null>('')
const router = useRouter()
const handleTokenExpiration = () => {
    localStorage.removeItem('token')
    notification.warning({
        message: '登录已过期',
        duration: 4,
        description: '请重新登录',
    })
    router.push('/login')
}
onMounted(async () => {
    // 先检查token是否存在
    const token = localStorage.getItem('token')
    if (!token) {
        return
    }

    // 如果有token才发送请求
    const { send } = useRequest(ServerAPI_Token.Get<User>('/v1/me'), {
        immediate: false,
    })

    const response = await send()

    if (response.code === 200) {
        token_status.value = true
        avatar_url.value = response.avatar_url
        username.value = response.display_name
    }
    if (response.code === 401) {
        handleTokenExpiration()
    }
})

const fetchNotifications = () => {
    // 此处仅作示例，实际接口调用可替换
    unreadCount.value = 0
}

setTimeout(() => {
    if (token_status.value) {
        fetchNotifications()
        setInterval(fetchNotifications, 60000)
    }
}, 100)

interface SearchResult {
    id: string
    name: string
    // 根据后端返回可扩展其他字段
}
// 搜索功能
const performSearch = useDebounceFn(async () => {
    if (!searchQuery.value) {
        searchResults.value = []
        showDropdown.value = false
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
        showDropdown.value = true
    } catch (error) {
        console.error('搜索失败:', error)
        searchResults.value = []
    } finally {
        searchLoading.value = false
    }
}, 300)

const searchOptions = computed(() => {
    return searchResults.value.map((item) => ({
        label: item.name,
        key: item.id,
        props: {
            onClick: () => router.push(`/details/${item.id}`),
            style: { cursor: 'pointer' },
        },
    }))
})

const handleBlur = () => {
    setTimeout(() => {
        showDropdown.value = false
    }, 200)
}

// 登出逻辑
const handleLogout = () => {
    msgDialog.warning({
        title: '确认退出',
        content: '确定要退出当前账号吗？',
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: () => {
            localStorage.removeItem('token')
            window.location.reload()
        },
    })
}

// 图标渲染
function renderIcon(icon: Component) {
    return () => h(NIcon, null, { default: () => h(icon) })
}

// 下拉菜单选项
const dropdownOptions = [
    {
        label: '个人中心',
        key: 'profile',
        icon: renderIcon(markRaw(PersonCircleOutline)),
        props: {
            onClick: () => router.push('/user'),
            style: { cursor: 'pointer' },
        },
    },
    {
        label: '退出登录',
        key: 'logout',
        icon: renderIcon(markRaw(LogOutOutline)),
        props: {
            onClick: handleLogout,
            style: { cursor: 'pointer' },
        },
    },
]

// 优化：对滚动事件进行节流处理
const isScrolled = ref(false)
const isHovered = ref(false)
const handleScroll = useThrottleFn(() => {
    isScrolled.value = window.scrollY > 21
}, 100)

useEventListener(window, 'scroll', handleScroll, { passive: true })

const handleMouseEnter = () => {
    isHovered.value = true
}

const handleMouseLeave = () => {
    isHovered.value = false
}
</script>

<template>
    <header
        class="c_header"
        :class="{ scrolled: isScrolled && !isHovered }"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
    >
        <div class="logo">
            <NuxtLink to="/">
                <img
                    width="40"
                    height="40"
                    :src="Logo"
                    class="logo-img"
                    :alt="lang.NavBar.title + ' 标志 - 返回首页'"
                />
            </NuxtLink>
            <h2>{{ lang.NavBar.title }}</h2>
        </div>
        <div class="search-container">
            <a-input
                v-model:value="searchQuery"
                placeholder="搜索服务器..."
                role="searchbox"
                allowClear
                @change="performSearch"
                @focus="showDropdown = true"
                @blur="handleBlur"
            >
                <template #prefix>
                    <n-icon :component="SearchOutline" />
                </template>
            </a-input>
            <a-dropdown
                placement="bottom"
                trigger="manual"
                :options="searchOptions"
                :show="showDropdown && searchOptions.length > 0"
                :loading="searchLoading"
            >
                <div></div>
            </a-dropdown>
        </div>
        <div class="account">
            <n-badge :value="unreadCount" :max="99" v-if="token_status">
                <n-icon
                    size="20"
                    class="notify-icon"
                    aria-label="通知"
                    role="status"
                >
                    <Notifications />
                </n-icon>
            </n-badge>
            <n-dropdown
                v-if="token_status && avatar_url"
                placement="bottom-end"
                trigger="hover"
                :options="dropdownOptions"
            >
                <div class="avatar-wrapper">
                    <n-avatar
                        size="medium"
                        :src="avatar_url"
                        :alt="username + ' 的头像'"
                        role="img"
                        aria-labelledby="avatar-label"
                    />
                    <span class="username">{{ username }}</span>
                    <span id="avatar-label" class="sr-only">
                        {{ username }} 的个人资料头像
                    </span>
                </div>
                <a-modal
                    v-model:visible="showModal"
                    title="确认退出"
                >
                    <p>确定要退出当前账号吗？</p>
                </a-modal>
            </n-dropdown>
            <NuxtLink v-else class="login" to="/auth">登录</NuxtLink>
        </div>
    </header>
</template>

<style scoped lang="less">
@import '../assets/css/variables.less';

.c_header {
    display: flex;
    align-items: center;
    height: 100%;
    justify-content: space-between;
    padding: 0 1rem;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: @primary;
    @media (prefers-color-scheme: dark) {
        background: @primary-dark;
    }
    backdrop-filter: blur(2px);
    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: radial-gradient(
            circle,
            rgba(0, 0, 0, 0.05) 1px,
            transparent 1px
        );
        background-size: 8px 8px;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
    }

    &.scrolled {
        background: rgba(255, 255, 255, 0.637) !important;
        box-shadow: none;

        &::before {
            opacity: 1;
        }

        .logo {
            opacity: 0.6;
        }

        .search-container .n-input {
            background: none;
            opacity: 0.6;
        }
        .account {
            opacity: 0.6;
        }
    }

    &:hover {
        background: @primary !important;
        @media (prefers-color-scheme: dark) {
            background: @primary-dark !important;
        }
        &::before {
            opacity: 0 !important;
        }
        .logo h2 {
            opacity: 1 !important;
            transform: scale(1) !important;
        }
    }
    .logo {
        display: flex;
        gap: 1rem;
        align-items: center;
        transition: all 0.4s;
        .logo-img {
            transition: transform 0.3s;
            &:hover {
                transform: rotate(-15deg);
            }
        }
        h2 {
            background: @background-light;
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
        }
    }
    .search-container {
        flex: 1;
        max-width: 400px;
        margin: 0 2rem;
        position: relative;
        .n-input {
            transition: all 0.4s;
            width: 100%;
            border-radius: 15px;
        }
        .n-dropdown {
            width: 100%;
            position: absolute;
            top: 100%;
            z-index: 1000;
            margin-top: 4px;
        }
    }
    .account {
        display: flex;
        gap: 1.5rem;
        align-items: center;
        height: 2rem;
        transition: all 0.4s;
        color: @background-light;
        .notify-icon {
            cursor: pointer;
            padding: 4px;
            border-radius: 50%;
            transition: all 0.3s;
            &:hover {
                background: @hover-primary;
                transform: scale(1.1);
            }
        }
        .avatar-wrapper {
            display: flex;
            align-items: center;
            gap: 0.8rem;
            padding: 4px 8px;
            border-radius: 20px;
            transition: all 0.3s;
            cursor: pointer;
            &:hover {
                background: @hover-primary;
                .username {
                    color: @background-light;
                }
            }
            .username {
                max-width: 120px;
                overflow: hidden;
                text-overflow: ellipsis;
                color: @background-light;
                transition: color 0.3s;
            }
            .sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border: 0;
            }
        }
        .login {
            font-size: 1rem;
            color: #2c3e50;
            padding: 6px 16px;
            border-radius: 20px;
            background: #f0f2f5;
            transition: all 0.3s;
            &:hover {
                background: #e0e2e5;
                color: #2c3e50;
            }
        }
    }
}

@media (max-width: 1200px) {
    .c_header {
        padding: 0 1rem;
        .logo h2 {
            display: none;
        }
        .search-container {
            margin: 0 1rem;
            max-width: 300px;
        }
        .account {
            .username {
                display: none;
            }
            .avatar-wrapper {
                padding: 4px;
            }
        }
    }
}

@media (max-width: 768px) {
    .c_header {
        z-index: 2000;
        .search-container {
            display: none;
        }
    }
}
</style>
