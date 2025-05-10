<script setup lang="ts">
import commit_hash from '@/assets/commit-hash.svg'
import Logo from '@/assets/logo.svg'
const title = useState<string>('pageTitle')
title.value = '关于 MineShowcase'

useHead({
    title: title,
})
const runtimeConfig = useRuntimeConfig()
const commitHash = runtimeConfig.public.commitHash
    ? runtimeConfig.public.commitHash.slice(0, 8)
    : 'dev build'
const githubCommitUrl = computed(() =>
    runtimeConfig.public.commitHash
        ? `https://github.com/MSCPO/MineShowcase/commit/${runtimeConfig.public.commitHash}`
        : 'https://github.com/MSCPO/MineShowcase',
)
</script>

<template>
    <div class="about-box">
        <div class="logo-box">
            <img class="logo-img" :src="Logo" />
            <div class="logo-title">
                <h1>MineShowcase</h1>
                <div class="ver">
                    Commit: (
                    <img :src="commit_hash" alt="commit 图标" />
                    <a
                        :href="githubCommitUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {{ commitHash }}
                    </a>
                    )
                </div>
                <div class="icons">
                    <a-tooltip title="项目 Github 仓库">
                        <a
                            href="https://github.com/MSCPO/MineShowcase"
                            class="icon"
                        >
                            <GithubOutlined />
                        </a>
                    </a-tooltip>

                    <a-tooltip title="玩家交流群">
                        <a href="https://qm.qq.com/q/SHcbys4Scw" class="icon">
                            <QqOutlined />
                        </a>
                    </a-tooltip>

                    <!-- <ClientOnly>
                        <a-tooltip
                            v-if="$pwa?.isPWAInstalled"
                            title="应用已安装"
                        >
                            <div class="icon">
                                <AppstoreOutlined />
                            </div>
                        </a-tooltip>
                        <a-tooltip v-else title="安装此应用">
                            <div @click="$pwa?.install" class="icon">
                                <AppstoreAddOutlined />
                            </div>
                        </a-tooltip>
                    </ClientOnly> -->
                </div>
            </div>
        </div>

        <a-card title="关于 MineShowcase">
            <p>
                MineShowcase 是一个以 MSCPO/ServerAPI 作为后端的 MSCPO
                开源宣传平台
            </p>
            <p>此项目基于 Vue 3 语言，以及 Nuxt 3 框架</p>
            <p>MineShowcase © 2025 MSCPO 保留所有权利。</p>
        </a-card>
    </div>
</template>

<style scoped lang="less">
@import '@/assets/css/variables.less';
.about-box {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-items: center;
    padding: 1rem;
    .logo-box {
        display: flex;
        box-sizing: border-box;
        padding: 4rem;
        @media screen and (max-width: 768px) {
            padding: 0;
            flex-direction: column;
            align-items: center;
            padding-block-end: 1rem;
        }
        .logo-img {
            width: 8rem;
        }
        .logo-title {
            color: @text-color-light;
            display: flex;
            line-height: 1rem;
            flex-direction: column;
            padding-inline: 1rem;
            @media (prefers-color-scheme: dark) {
                color: @text-color-dark;
            }
            .ver {
                font-size: 0.8rem;
                color: @text-color-light;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                @media (prefers-color-scheme: dark) {
                    color: @text-color-dark;
                }
                img {
                    width: 1rem;
                    height: 1rem;
                    filter: invert(1);
                }
            }
            .ver a {
                color: inherit;
                text-decoration: none;
                transition: color 0.3s ease;

                &:hover {
                    color: @hover-primary;
                    text-decoration: underline;
                }
            }
            .icons {
                width: 100%;
                padding-top: 1rem;
                display: flex;
                justify-content: center;
                gap: 1rem;
                .icon {
                    color: @text-color-light;
                    @media (prefers-color-scheme: dark) {
                        color: @text-color-dark;
                    }
                    width: 32px;
                    height: 32px;
                    border-radius: 1rem;
                    word-break: break-all;
                    text-decoration: none;
                    display: flex;
                    justify-content: center;
                    cursor: pointer;
                    align-items: center;
                    font-size: 1.5rem;
                    text-align: center;
                    transition: all 0.3s ease;
                    &:hover {
                        background: @hover-primary;
                        transform: scale(1.2);
                    }
                }
            }
        }
    }
}
</style>
