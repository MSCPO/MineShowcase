<script setup lang="ts">
import { watch, shallowRef, provide } from 'vue'
import Stats from './components/stats.vue'
import Recommend from './components/recommend.vue'
import Filter from './components/filter.vue'
import { useRoute } from 'vue-router'

// 定义事件处理函数
const handleFilterChange = (filterOptions: any) => {
    // 使用自定义事件将筛选条件发送给父组件
    emit('filter-change', filterOptions)
}

// 定义事件
const emit = defineEmits(['filter-change'])

// 使用 useRoute 获取当前路由信息
const route = useRoute()

// 导航栏组件映射表
const sidebarComponents: Record<string, Component> = {
    default: Stats,
    Stats: Stats,
    Recommend: Recommend,
    Filter: Filter,
}

// 初始化导航栏类型为数组，默认值从路由元信息获取，若没有则使用 ['default']
let sidebarTypes: string[] = (route.meta.sidebar as string[]) || ['default']

// 浅引用存储当前要显示的导航栏组件，初始化为映射表中第一个导航栏类型对应的组件，若没有则使用默认组件
const SideBarComponents = shallowRef(
    sidebarTypes.map(
        (type) => sidebarComponents[type] || sidebarComponents['default'],
    ),
)

watch(
    () => route.meta.sidebar,
    (newSideBarTypes) => {
        if (newSideBarTypes === false) {
            // 当 route.meta.sidebar  为 false 时，清空导航栏组件数组
            SideBarComponents.value = []
            console.log(
                'Sidebar  is set to false, no components will be rendered.',
            )
        } else {
            // 打印调试日志，记录导航栏类型的变化
            console.log('Sidebar  types changed:', newSideBarTypes)
            // 更新导航栏类型数组，若新值不存在则使用 ['default']
            sidebarTypes = (newSideBarTypes as string[]) || ['default']
            // 更新要显示的导航栏组件数组，将每个导航栏类型映射为对应的组件，若没有则使用默认组件
            SideBarComponents.value = sidebarTypes.map(
                (type) => sidebarComponents[type] || sidebarComponents['default'],
            )
            // 打印调试日志，记录新的导航栏组件数组
            console.log('New  SideBarComponents:', SideBarComponents.value)
        }
    },
)
</script>

<template>
    <div class="content-wrapper">
        <transition-group name="slide" tag="div">
            <component v-for="(component, index) in SideBarComponents" :is="component" :key="index"
                @filter-change="handleFilterChange" />
        </transition-group>
    </div>
</template>
<style scoped lang="less">
@import '@/assets/css/variables.less';

.content-wrapper {
    padding: 0.75rem;
    max-height: 100%;
    overflow-y: auto;
    scrollbar-width: thin;

    &::-webkit-scrollbar {
        width: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 4px;

        @media (prefers-color-scheme: dark) {
            background: rgba(255, 255, 255, 0.2);
        }
    }

    @media (max-width: 768px) {
        padding: 0.5rem;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        /* 增强iOS滚动体验 */
    }
}

.section {
    width: 100%;
    border: 0px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    transition: all 0.3s ease;

    @media (prefers-color-scheme: dark) {
        background: @surface-dark;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    margin-bottom: 16px;

    &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

        @media (prefers-color-scheme: dark) {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
    }

    .card-title {
        font-weight: 600;
        font-size: 16px;
        color: @text-color-light;
        padding: 12px 0;

        @media (prefers-color-scheme: dark) {
            color: @text-color-dark;
        }
    }

    @media (max-width: 768px) {
        border-radius: 6px;
        margin-bottom: 12px;
    }
}

/* 动画效果 */
.slide-enter-active {
    transition:
        transform 0.4s ease,
        opacity 0.5s ease;
}

.slide-leave-active {
    transition:
        transform 0.3s ease,
        opacity 0.2s ease;
}

.slide-enter-from,
.slide-leave-to {
    transform: translateY(-20px);
    opacity: 0;
}

.slide-enter-to,
.slide-leave-from {
    transform: translateY(0);
    opacity: 1;
}
</style>
