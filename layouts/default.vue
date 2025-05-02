<script setup lang="ts">
import SideBar from '@/components/SideBar/SideBar.vue'
import { ref, provide, reactive } from 'vue'

const isActive = ref(false)

// 创建响应式的筛选选项对象
const filterOptionsData = reactive({
    value: {
        playerRange: [0, 500] as [number, number],
        modes: [] as string[],
        authModes: [] as string[],
        tags: [] as string[]
    }
})

// 提供筛选选项给子组件
provide('filterOptions', filterOptionsData)

// 定义筛选事件处理函数
const handleFilterChange = (options: any) => {
    // 更新响应式对象的值
    filterOptionsData.value = options
}
</script>
<template>
    <div class="layout">
        <header class="header">
            <Header />
        </header>
        <div class="content">
            <aside class="sidebar" :class="{ active: isActive }">
                <SideBar @filter-change="handleFilterChange" />
            </aside>
            <main class="main-content">
                <slot />
            </main>
        </div>
        <a-float-button-group class="menu_button" shape="square" :style="{ right: '20px' }">
            <a-float-button @click="isActive = !isActive">
                <template #icon>
                    <MoreOutlined />
                </template>
            </a-float-button>
        </a-float-button-group>
    </div>
</template>

<style lang="less">
@import '../assets/css/default.less';

.slide-enter-from,
.slide-leave-to {
    transform: translateY(-100%);
    opacity: 0;
}

.slide-enter-to,
.slide-leave-from {
    transform: translateY(0);
    opacity: 1;
}

.active {
    transform: translateX(0) !important;
}

/* 移动端适配优化 */
@media (max-width: 768px) {
    .layout {
        .content {
            padding: 12px;
            gap: 12px;
        }

        .sidebar {
            width: 85%;
            max-width: 300px;
            border-radius: 0;
            box-shadow: 2px 0 10px rgba(0, 0, 0, 0.15);
            z-index: 100;

            @media (prefers-color-scheme: dark) {
                box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
            }
        }

        .menu_button {
            bottom: 24px;
            z-index: 99;
        }
    }
}

/* 平板适配 */
@media (min-width: 769px) and (max-width: 1200px) {
    .layout .sidebar {
        width: 240px;
    }
}
</style>
