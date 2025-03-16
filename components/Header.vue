<script setup lang="ts">
import lang from '../languages/index'
import Logo from '../assets/logo.webp'
import { ref, onMounted, computed, h } from 'vue'
import { ServerAPI_Token } from '../hooks/api'
import { useRequest } from 'alova/client'
import { notification, Modal } from 'ant-design-vue'
import { SolutionOutlined, UnlockOutlined } from '@ant-design/icons-vue'
import type { User } from '../hooks/type_models'
import { useThrottleFn, useEventListener } from '@vueuse/core'
import GlobalSearch from './GlobalSearch/GlobalSearch.vue'

const username = ref('')
const token_status = ref(false)
const unreadCount = ref(0)
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

// 登出逻辑
const handleLogout = () => {
    Modal.confirm({
        title: '确认退出',
        content: '确定要退出当前账号吗？',
        okText: '确定',
        cancelText: '取消',
        onOk() {
            localStorage.removeItem('token')
            window.location.reload()
        },
    })
}

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
            <GlobalSearch />
        </div>
        <div class="account">
            <a-badge :badge="unreadCount" :max="99" v-if="token_status">
                <NotificationFilled class="notify-icon" />
            </a-badge>
            <a-dropdown v-if="token_status && avatar_url">
                <div class="avatar-wrapper">
                    <a-avatar
                        size="default"
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
                <template #overlay>
                    <a-menu>
                        <a-menu-item
                            key="profile"
                            @click="router.push('/user')"
                        >
                            <SolutionOutlined />
                            个人中心
                        </a-menu-item>
                        <a-menu-item key="logout" @click="handleLogout">
                            <UnlockOutlined />
                            退出登录
                        </a-menu-item>
                    </a-menu>
                </template>
            </a-dropdown>
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
        .a-input {
            transition: all 0.4s;
            width: 100%;
            border-radius: 15px;
        }
        .a-dropdown {
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
            color: @background-light;
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
