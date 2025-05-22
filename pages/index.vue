<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Logo from '@/assets/logo.svg'
import GridBackground from '@/components/Background/GridBackground.vue'

const title = useState<string>('pageTitle')
title.value = 'MSCPO'

useHead({
    title: title,
})

// 设置使用home布局，仅首页使用
definePageMeta({
    layout: 'home',
})


const isLoaded = ref(false)
const showContent = ref(false)

onMounted(() => {
    setTimeout(() => {
        isLoaded.value = true
        setTimeout(() => {
            showContent.value = true
        }, 500)
    }, 300)
})
</script>

<template>
    <div class="home-container" :class="{ loaded: isLoaded }">
        <GridBackground />
        <div class="content-wrapper" :class="{ show: showContent }">
            <div class="logo-container">
                <img :src="Logo" alt="MSCPO Logo" class="logo" />
                <h1 class="main-title">
                    <span class="gradient-text">MSCPO</span>
                    <span class="sub-title">集体宣传组织</span>
                </h1>
            </div>

            <div class="description">
                <div class="slogan">打造专业的 Minecraft 社区平台</div>
                <div class="divider"></div>
                <div class="features-text">
                    <span class="highlight">服务器宣传</span>
                    ·
                    <span class="highlight">技术交流</span>
                    ·
                    <span class="highlight">资源共享</span>
                </div>
            </div>

            <div class="cta-container">
                <NuxtLink
                    to="/serverlist"
                    class="cta-button primary"
                    aria-label="探索服务器宇宙"
                >
                    <span>探索服务器宇宙</span>
                    <div class="hover-effect"></div>
                </NuxtLink>
                <NuxtLink
                    to="/about"
                    class="cta-button secondary"
                    aria-label="了解我们的使命"
                >
                    <span>了解我们的使命</span>
                    <div class="hover-effect"></div>
                </NuxtLink>
            </div>
        </div>
    </div>
</template>

<style scoped lang="less">
.home-container {
    padding-top: 15vh;
    display: flex;
    justify-content: center;
    position: relative;
    color: #fff;
    overflow: hidden;

    .content-wrapper {
        position: relative;
        max-width: 800px;
        text-align: center;

        .logo-container {
            .logo {
                width: 160px;
                height: 160px;
                margin: 0 auto 2rem;
                filter: drop-shadow(0 0 20px rgba(0, 168, 232, 0.5));
                animation: float 6s ease-in-out infinite;
            }
            .main-title {
                font-size: 4rem;
                font-weight: 900;
                letter-spacing: 2px;
                margin: 0 0 1rem;
                line-height: 1.1;
                .gradient-text {
                    background: linear-gradient(
                        135deg,
                        #6adaff 0%,
                        #0077cc 100%
                    );
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .sub-title {
                    display: block;
                    font-size: 2.2rem;
                    font-weight: 600;
                    margin-top: 1rem;
                    color: rgba(255, 255, 255, 0.9);
                }
            }
        }

        .description {
            margin-bottom: 3rem;
            .slogan {
                font-size: 1.8rem;
                font-weight: 300;
                margin-bottom: 2rem;
                letter-spacing: 1px;
            }
            .divider {
                width: 200px;
                height: 2px;
                background: #ffffff;
                margin: 2rem auto;
            }
            .features-text {
                font-size: 1.4rem;
                .highlight {
                    color: #6adaff;
                    font-weight: 500;
                    padding: 0 0.5rem;
                }
            }
        }

        .cta-container {
            display: flex;
            gap: 2rem;
            justify-content: center;
            .cta-button {
                position: relative;
                padding: 0.9rem 2rem;
                border-radius: 20px;
                font-size: 1.1rem;
                font-weight: 600;
                text-decoration: none;
                transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
                overflow: hidden;
                border: 2px solid transparent;
                &.primary {
                    background: linear-gradient(
                        135deg,
                        #00a8e8 0%,
                        #0077cc 100%
                    );
                    color: white;
                    box-shadow: 0 8px 30px rgba(0, 168, 232, 0.3);
                }
                &.secondary {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                    border-color: rgba(255, 255, 255, 0.3);
                    backdrop-filter: blur(8px);
                }
                .hover-effect {
                    position: absolute;
                    background: rgba(255, 255, 255, 0.15);
                    width: 120%;
                    height: 100%;
                    left: -10%;
                    top: 0;
                    transform: skewX(-30deg) scaleX(0);
                    transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
                }
                &:hover {
                    transform: translateY(-3px);
                    .hover-effect {
                        transform: skewX(-30deg) scaleX(1);
                    }
                }
            }
        }
    }

    @keyframes float {
        0%,
        100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-20px);
        }
    }

    @media (max-width: 768px) {
        .content-wrapper {
            .logo-container {
                .logo {
                    width: 120px;
                    height: 120px;
                }
                .main-title {
                    font-size: 2.5rem;
                    .sub-title {
                        font-size: 1.5rem;
                    }
                }
            }
            .description {
                .slogan {
                    font-size: 1.2rem;
                }
                .features-text {
                    font-size: 1.1rem;
                }
            }
            .cta-container {
                flex-direction: column;
                gap: 1rem;
            }
        }
    }
}
</style>
