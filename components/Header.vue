<script setup lang="ts">
import Logo from '../assets/logo.webp'
import { ref, onMounted } from 'vue'
import { useRequest } from 'alova/client'
import { notification, Modal } from 'ant-design-vue'
import {
    SolutionOutlined,
    UnlockOutlined,
    NotificationFilled,
    UserOutlined,
} from '@ant-design/icons-vue'
import type { UserMe } from '@/api/models'
import { useThrottleFn, useEventListener } from '@vueuse/core'
import GlobalSearch from './GlobalSearch/GlobalSearch.vue'

const { $serverAPI_Token } = useNuxtApp()
// 页面标题
const pageTitle = useState<string>('pageTitle')
watch(useState<string>('pageTitle'), (newTitle) => {
    pageTitle.value = newTitle
})

// 用户信息
const username = ref('')
const token_status = ref(false)
const unreadCount = ref(0)
const avatar_url = ref<string | null>('')
const router = useRouter()

// Token 过期处理
const handleTokenExpiration = () => {
    localStorage.removeItem('token')
    notification.warning({
        message: '登录已过期',
        duration: 4,
        description: '请重新登录',
    })
    router.push('/login')
}

// 页面加载时检查 Token 状态
onMounted(async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    const cached = localStorage.getItem('user_me_cache')
    if (cached) {
        try {
            const parsed: UserMe = JSON.parse(cached)
            // 立即展示缓存数据
            username.value = parsed.display_name
            avatar_url.value = parsed.avatar_url
            token_status.value = true
        } catch {
            localStorage.removeItem('user_me_cache')
        }
    }

    // 后台自动校验是否过期
    try {
        const { send } = useRequest($serverAPI_Token.Get<UserMe>('/v1/me'), {
            immediate: false,
        })
        const response = await send()

        if (response.code === 200) {
            token_status.value = true
            username.value = response.display_name
            avatar_url.value = response.avatar_url
            localStorage.setItem('user_me_cache', JSON.stringify(response))
        } else if (response.code === 401) {
            handleTokenExpiration()
        }
    } catch (err) {
        console.error('验证 token 状态失败:', err)
    }
})

// 通知逻辑
const fetchNotifications = () => {
    unreadCount.value = 0 // 示例，实际可替换为接口调用
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

// 滚动事件处理
const isScrolled = ref(false)
const isHovered = ref(false)

const handleMouseEnter = () => {
    isHovered.value = true
}

const handleMouseLeave = () => {
    isHovered.value = false
}

const MenuDisplay = ref(false)
</script>

<template>
    <header
        class="c_header"
        :class="{ scrolled: isScrolled && !isHovered }"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
    >
        <div class="logo">
            <NuxtLink to="/" aria-label="返回主页">
                <img
                    width="40"
                    height="40"
                    :src="Logo"
                    class="logo-img"
                    :alt="pageTitle + ' 标志 - 返回首页'"
                />
            </NuxtLink>
            <transition name="title-swap" mode="out-in">
                <h3 :key="pageTitle">{{ pageTitle }}</h3>
            </transition>
        </div>
        <div class="r_header">
            <MenuOutlined
                @click="MenuDisplay = !MenuDisplay"
                class="menubtn"
                aria-label="展开菜单"
            />
            <div class="search-container">
                <GlobalSearch />
            </div>
            <a-button class="r-btn" type="text" @click="router.push('/about/')">
                关于
            </a-button>
            <div class="account">
                <a-badge :badge="unreadCount" :max="99" v-if="token_status">
                    <NotificationFilled class="notify-icon" />
                </a-badge>
                <a-dropdown v-if="token_status && avatar_url">
                    <div class="avatar-wrapper">
                        <a-avatar
                            size="default"
                            :src="avatar_url ?? undefined"
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
                                @click="router.push('/user/me')"
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
                <NuxtLink v-else class="login" to="/auth">
                    <a-avatar
                        :size="32"
                        :src="avatar_url ?? undefined"
                        :alt="username + ' 的头像'"
                        role="img"
                    >
                        <template #icon><UserOutlined /></template>
                    </a-avatar>
                </NuxtLink>
            </div>
        </div>
        <!-- 下拉菜单 -->
        <transition name="slide-down">
            <div class="mobile-menu" v-if="MenuDisplay">
                <div class="menu-box">
                    <div class="menu-item">
                        <GlobalSearch v-model="MenuDisplay" />
                    </div>
                    <div @click="MenuDisplay = false">
                        <div
                            class="menu-item menu-btn"
                            @click="router.push('/')"
                        >
                            <HomeOutlined />
                            首页
                        </div>
                        <div
                            class="menu-item menu-btn"
                            @click="router.push('/about/')"
                        >
                            <InfoCircleOutlined />
                            关于
                        </div>
                    </div>
                    <div v-if="token_status" @click="MenuDisplay = false">
                        <div
                            class="menu-item menu-btn"
                            @click="router.push('/user/me')"
                        >
                            <SolutionOutlined />
                            个人中心
                        </div>
                        <div class="menu-item menu-btn" @click="handleLogout()">
                            <UnlockOutlined />
                            退出登录
                        </div>
                    </div>
                    <div v-else @click="MenuDisplay = false">
                        <div
                            class="menu-item menu-btn"
                            @click="router.push('/auth')"
                        >
                            <SolutionOutlined />
                            登录账户
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </header>
</template>

<style scoped lang="less">
@import '@/assets/css/variables.less';

.c_header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    padding: 0 2rem;
    position: relative;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: @primary-light;
    backdrop-filter: blur(2px);
    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

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
        background: rgba(255, 255, 255, 0.233) !important;
        box-shadow: none;

        &::before {
            opacity: 1;
        }

        .logo,
        .account {
            opacity: 0.6;
        }
    }

    &:hover {
        &::before {
            opacity: 0 !important;
        }

        .logo h3 {
            opacity: 1 !important;
            transform: scale(1) !important;
        }
    }

    @media (prefers-color-scheme: dark) {
        background: @primary-dark;
    }

    @media (max-width: 1200px) {
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

    @media screen and (max-width: 768px) {
        z-index: 2000;

        .search-container,
        .account,
        .login {
            display: none;
        }
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

    h3 {
        position: relative;
        font-weight: normal;
        background: @background-light;
        -webkit-background-clip: text;
        background-clip: text;
        color: @background-light;
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

.r_header {
    display: flex;
    align-items: center;
    gap: 1rem;

    .menubtn {
        display: none;
        font-size: 1.4rem;
        height: 1.4rem;
        width: 1.4rem;
        cursor: pointer;
        padding: 0.4rem;
        border-radius: 50%;
        transition: all 0.3s;
        color: @background-light;

        &:hover {
            background: @hover-primary;
            transform: scale(1.1);
        }
        @media screen and (max-width: 768px) {
            display: block;
        }
    }
    .r-btn {
        @media screen and (max-width: 768px) {
            display: none;
        }
        color: @background-light;
        @media (prefers-color-scheme: dark) {
            color: @background-light;

            &:hover {
                background: @primary-dark !important;
            }
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
            transition: all 0.3s;

            &:hover {
                transform: scale(1.1);
            }
        }
    }
}

.mobile-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: @background-light;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    height: 100vh;
    transition: all 0.3s ease;
    @media (prefers-color-scheme: dark) {
        background: @background-dark;
    }
    .menu-box {
        margin: 0 auto;
        padding: 24px 0 96px;
        color: @text-color-light;
        @media (prefers-color-scheme: dark) {
            color: @text-color-dark;
        }
        max-width: 280px;
        .menu-item {
            display: block;
            padding: 12px 0 11px;
            line-height: 24px;
            font-size: 14px;
            font-weight: 500;

            transition:
                border-color 0.25s,
                color 0.25s;
        }
        .menu-btn {
            cursor: pointer;
            border-bottom: 1px solid @border-color;
        }
    }
}

// 下拉菜单动画
.slide-down-enter-active,
.slide-down-leave-active {
    transition:
        transform 0.3s ease,
        opacity 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
    transform: translateY(-10px);
    opacity: 0;
}

.slide-down-enter-to,
.slide-down-leave-from {
    transform: translateY(0);
    opacity: 1;
}

@media (min-width: 768px) {
    .mobile-menu {
        display: none;
    }
}

.title-swap-enter-active {
    animation: slideIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

@keyframes slideIn {
    from {
        transform: translateY(20px) rotateX(-30deg);
        opacity: 0;
        filter: blur(2px);
    }
    to {
        transform: translateY(0) rotateX(0);
        opacity: 1;
        filter: blur(0);
    }
}
</style>
