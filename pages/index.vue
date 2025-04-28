<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Logo from '@/assets/logo.svg'
import BgImage from '@/assets/bg.webp'

// 设置使用home布局，仅首页使用
definePageMeta({
    layout: 'home'
})

// 设置页面标题
useHead({
    title: 'Minecraft集体宣传组织(MSCPO)',
    script: [
        {
            type: 'module',
            src: 'https://unpkg.com/@splinetool/viewer@1.9.87/build/spline-viewer.js'
        }
    ]
})

const isLoaded = ref(false)
const showContent = ref(false)

onMounted(() => {
    // 添加加载动画效果
    setTimeout(() => {
        isLoaded.value = true
        setTimeout(() => {
            showContent.value = true
        }, 500)
    }, 300)
})
</script>

<template>
    <div class="home-container" :class="{ 'loaded': isLoaded }">
        <ClientOnly>
            <div class="spline-bg" :key="splineKey">
                <spline-viewer 
                    url="https://prod.spline.design/PmS-CR5jQj2Lf6R8/scene.splinecode"
                    v-if="showContent"
                    @load="() => isLoaded = true"
                />
            </div>
        </ClientOnly>

        <div class="content-wrapper" :class="{ 'show': showContent }">
            <div class="logo-container">
                <img :src="Logo" alt="MSCPO Logo" class="logo" />
                <h1 class="main-title">MINECRAFT<br /><span>集体宣传组织</span></h1>
            </div>

            <div class="description">
                <p>专业的Minecraft服务器宣传与技术交流平台</p>
                <p>提供服务器列表、教程和集体宣传</p>
            </div>

            <div class="cta-container">
                <NuxtLink to="/serverlist" class="cta-button primary">
                    <span>浏览服务器列表</span>
                </NuxtLink>
                <NuxtLink to="/about" class="cta-button secondary">
                    <span>关于我们</span>
                </NuxtLink>
            </div>

            <div class="features">
                <div class="feature-item">
                    <a-badge status="processing" text="服务器宣传" />
                </div>
                <div class="feature-item">
                    <a-badge status="processing" text="技术交流" />
                </div>
                <div class="feature-item">
                    <a-badge status="processing" text="资源分享" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.home-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    position: relative;
    overflow: hidden;
    padding: 2rem;
    color: #333;
    transition: opacity 0.8s ease;
    opacity: 0;
    background-color: white;
}

.spline-bg {
    position: absolute;
    top: -10vh;
    left: -20vw;
    width: 100vw;
    height: 100vh;
    z-index: 0;
    object-fit: none;
}

.spline-bg spline-viewer {
    width: 125%;
    height: 125%;
}

.home-container.loaded {
    opacity: 1;
}



.content-wrapper {
    position: relative;
    z-index: 2;
    max-width: 600px;
    width: 100%;
    transform: translateY(30px);
    opacity: 0;
    transition: all 0.8s ease;
    margin-left: 10%;
    user-select: none;
}

.content-wrapper.show {
    transform: translateY(0);
    opacity: 1;
}

.logo-container {
    margin-bottom: 2rem;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.logo {
    width: 120px;
    height: 120px;
    margin-bottom: 1rem;
    filter: drop-shadow(0 0 10px rgba(0, 168, 232, 0.7));
    animation: pulse 3s infinite ease-in-out;
}

.main-title {
    font-size: 3rem;
    font-weight: 800;
    letter-spacing: 2px;
    margin: 0;
    line-height: 1.2;
    background: linear-gradient(135deg, #333 0%, #00a8e8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.main-title span {
    font-size: 2rem;
    font-weight: 600;
}

.description {
    margin-bottom: 2.5rem;
    font-size: 1.2rem;
    line-height: 1.6;
    color: #666;
}

.cta-container {
    display: flex;
    gap: 1.5rem;
    justify-content: flex-start;
    margin-bottom: 3rem;
    flex-wrap: wrap;
}

.cta-button {
    display: inline-block;
    background: linear-gradient(135deg, #00a8e8 0%, #0077cc 100%);
    padding: 0.8rem 2rem;
    border-radius: 50px;
    text-decoration: none;
    font-weight: 600;
    font-size: 1.1rem;
    letter-spacing: 1px;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(110, 110, 110, 0.7);
    z-index: 1;
}

.cta-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(-100%);
    transition: all 0.3s ease;
    z-index: -1;
}

.cta-button:hover::before {
    transform: translateX(0);
}

.cta-button.primary {
    background: linear-gradient(135deg, #00a8e8 0%, #0077cc 100%);
    color: white;
}

.cta-button.primary:hover {
    transform: translateY(-3px);
    box-shadow: 0 7px 20px rgba(0, 168, 232, 0.4);
}

.cta-button.secondary {
    background: transparent;
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.7);
}

.cta-button.secondary:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-3px);
}

.features {
    display: flex;
    justify-content: flex-start;
    gap: 2rem;
    flex-wrap: wrap;
}

.feature-item {
    padding: 0.8rem 1.5rem;
    background: rgba(0, 168, 232, 0.15);
    border-radius: 50px;
    backdrop-filter: blur(5px);
    border: 1px solid rgba(0, 168, 232, 0.3);
    transition: all 0.3s ease;
}

.feature-item:hover {
    background: rgba(0, 168, 232, 0.25);
    transform: translateY(-2px);
}

@keyframes pulse {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.05);
    }

    100% {
        transform: scale(1);
    }
}

/* 响应式设计 */
@media (max-width: 768px) {
    .main-title {
        font-size: 2.5rem;
    }

    .main-title span {
        font-size: 1.5rem;
    }

    .description {
        font-size: 1rem;
    }

    .cta-container {
        gap: 1rem;
    }

    .features {
        gap: 1rem;
    }

    .spline-bg {
        top: -10vh;
        left: -60vw;
    }

    .spline-bg spline-viewer {
        width: 180vw;
        height: 180vh;
    }
}
</style>