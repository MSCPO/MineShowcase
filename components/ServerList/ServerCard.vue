<script setup lang="ts">
import lozad from 'lozad'
import IMG_noicon from '../../assets/noicon.svg'
import IMG_noimage from '../../assets/noimage.webp'
import { ref, defineProps, onMounted, watch } from 'vue'
import { ServerAPI } from '../../hooks/api'
import { useRetriableRequest } from 'alova/client'
import type { Status, ListItem } from '../../hooks/type_models'
import { useNotification } from 'naive-ui'
import { useRouter } from 'vue-router'
const observer = lozad()
observer.observe()
const router = useRouter()
const info = defineProps<ListItem>()

// 设置 Intersection Observer 相关
const cardRef = ref<HTMLElement | null>(null)
const isCardVisible = ref(false)
const hasFetched = ref(false)

onMounted(() => {
    if (cardRef.value) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                isCardVisible.value = true
                observer.disconnect()
            }
        })
        observer.observe(cardRef.value)
    }
})

// 状态数据及加载标记
const Loading = ref(true)
const statusText = ref<string>('')
const statusIcon = ref<string>(IMG_noicon)
const statusColor = ref<{ color: string; textColor: string }>({
    color: '#00C5CD',
    textColor: '#dfe6e9',
})
const StatusInfo = ref<Status>({
    id: info.id,
    name: info.name,
    ip: null,
    type: 'BEDROCK',
    version: '',
    desc: '',
    link: '',
    is_member: true,
    is_hide: true,
    auth_mode: 'OFFICIAL',
    tags: [],
    status: null,
    code: 200,
    detail: undefined,
    permission: undefined,
})

// 延迟加载：只有当卡片进入视口且未发起请求时再请求状态数据
const fetchStatus = () => {
    const getStatus = () => ServerAPI.Get<Status>(`/v1/servers/info/${info.id}`)
    const { data, onSuccess, onError } = useRetriableRequest(getStatus(), {
        retry: 3,
    })

    onSuccess(() => {
        Loading.value = false
        StatusInfo.value = data.value
        if (data.value.code === 200) {
            if (data.value.status) {
                statusText.value = '在线'
                statusColor.value = { color: '#E3F3EB', textColor: '#18A058' }
                statusIcon.value = data.value.status.icon ?? IMG_noicon
            } else {
                statusText.value = '离线'
                statusColor.value = { color: '#747d8c', textColor: '#f1f2f6' }
                statusIcon.value = IMG_noicon
            }
        } else {
            statusText.value = '未知'
            statusColor.value = { color: '#C9C9C9', textColor: '#808080' }
            statusIcon.value = IMG_noicon
        }
    })

    onError(() => {
        Loading.value = false
        statusText.value = '错误'
        statusColor.value = { color: '#E9967A', textColor: '#CD5555' }
        statusIcon.value = IMG_noicon
    })
}

// 当卡片可见时触发 API 请求
watch(isCardVisible, (visible) => {
    if (visible && !hasFetched.value) {
        fetchStatus()
        hasFetched.value = true
    }
})

// 点击卡片跳转
const handleCardClick = () => {
    router.push(`/details/${info.id}`)
}

// 简单的数字格式化函数
const formatNumber = (num: number): string => {
    if (num >= 100000000) {
        return `${(num / 100000000).toFixed(2)} 亿`
    } else if (num >= 10000) {
        return `${(num / 10000).toFixed(2)} 万`
    }
    return num.toString()
}

// 复制到剪贴板操作（可以加防抖处理以减少重复触发）
const notification = useNotification()
const copyToClipboard = (event: MouseEvent) => {
    const input = event.target as HTMLInputElement
    const text = input.value

    navigator.clipboard
        .writeText(text)
        .then(() => {
            notification.success({
                content: '复制成功！OwO',
                duration: 2500,
                keepAliveOnHover: true,
            })
        })
        .catch(() => {
            notification.error({
                content: '复制失败，请重试！QAQ',
                duration: 2500,
                keepAliveOnHover: true,
            })
        })
}
</script>

<template>
    <!-- 为根节点绑定 ref 以供 Intersection Observer 监听 -->
    <div ref="cardRef" class="card" @click="handleCardClick">
        <div class="card-cover">
            <n-skeleton v-if="Loading" height="100%" width="100%" />
            <img
                v-else
                :src="IMG_noimage"
                alt="无图片"
                class="lozad"
                rel="preload"
                as="image"
            />
            <n-skeleton v-if="Loading" height="1.5rem" width="10rem" />
            <div v-else class="card-type" v-text="StatusInfo.type"></div>
        </div>
        <div class="card-split">
            <div class="card-icon">
                <n-skeleton v-if="Loading" height="100%" width="100%" />
                <img v-else :src="statusIcon" class="lozad" />
            </div>
            <div class="card-info">
                <div class="title-box">
                    <n-skeleton
                        v-if="Loading"
                        text
                        height="1.8rem"
                        width="8rem"
                    />
                    <h1 v-else class="title">{{ info.name }}</h1>
                    <n-skeleton
                        v-if="Loading"
                        text
                        height="0.8rem"
                        width="3rem"
                    />
                    <!-- 当状态数据加载后显示玩家人数 -->
                    <span v-else-if="StatusInfo.status" class="t_player_num">
                        ({{ formatNumber(StatusInfo.status.players.online) }} /
                        {{ formatNumber(StatusInfo.status.players.max) }})
                    </span>
                </div>
                <div>
                    <n-skeleton v-if="Loading" text style="height: 1rem" />
                    <n-input-group v-else>
                        <n-tag
                            size="small"
                            :color="statusColor"
                            v-text="statusText"
                        ></n-tag>
                        <n-input
                            @click.stop="copyToClipboard"
                            placeholder="加载中..."
                            :value="StatusInfo.ip"
                            readonly
                            size="tiny"
                            style="
                                width: auto;
                                min-width: 120px;
                                white-space: nowrap;
                                overflow: hidden;
                                text-overflow: ellipsis;
                            "
                        />
                    </n-input-group>
                </div>
            </div>
        </div>
        <div class="card-tags">
            <n-skeleton
                v-if="!StatusInfo.tags || StatusInfo.tags.length === 0"
                text
                style="height: 22px; width: 100%"
            />
            <n-space v-else size="small" class="tags-wrapper">
                <n-tag
                    size="small"
                    :bordered="false"
                    :type="
                        StatusInfo.auth_mode === 'OFFLINE'
                            ? 'error'
                            : StatusInfo.auth_mode === 'OFFICIAL'
                              ? 'success'
                              : 'info'
                    "
                    v-text="
                        StatusInfo.auth_mode === 'OFFLINE'
                            ? '离线服'
                            : StatusInfo.auth_mode === 'OFFICIAL'
                              ? '正版服'
                              : StatusInfo.auth_mode === 'YGGDRASIL'
                                ? '外置登录'
                                : '未知'
                    "
                ></n-tag>
                <n-tooltip
                    v-if="StatusInfo.is_member === true"
                    trigger="hover"
                    placement="top-start"
                >
                    <template #trigger>
                        <n-tag size="small" :bordered="false" type="info">
                            成员服
                        </n-tag>
                    </template>
                    <span>
                        此服务器是集体宣传组织的成员服
                        <br />
                        我们可以确保其可以长期运行
                    </span>
                </n-tooltip>
                <n-tag
                    v-for="(tag, index) in StatusInfo.tags.slice(0, 4)"
                    :key="index"
                    size="small"
                    :bordered="false"
                    :title="tag"
                    v-text="tag"
                />
            </n-space>
        </div>
    </div>
</template>

<style scoped lang="less">
@border-color: #ddd;

.card {
    overflow: hidden;
    height: 20rem;
    box-sizing: border-box;
    border: 2px solid @border-color;
    border-radius: 8px;
    box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.1);
    transition:
        transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1),
        box-shadow 0.3s cubic-bezier(0.25, 0.8, 0.25, 1),
        background 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

    &:hover {
        transform: scale(1.01);
        box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.2);
    }

    .card-cover {
        height: 60%;
        overflow: hidden;
        box-sizing: border-box;
        margin: 0.6rem;
        border: 2px dashed @border-color;
        position: relative;

        .card-type {
            position: absolute;
            height: 1.5rem;
            width: 10rem;
            right: -2.1rem;
            top: 1.5rem;
            line-height: 100%;
            text-align: center;
            transform: rotate(38deg);
            font-size: 1.4rem;
            font-weight: bold;
            color: #000;
            background-color: rgba(255, 255, 255, 0.7);
            border: 1px solid @border-color;
            border-radius: 5px;
        }

        .carousel-img {
            width: 100%;
            height: 100%;
            max-width: 100%;
            max-height: 100%;
            object-fit: cover;
        }

        img {
            max-width: 50%;
            max-height: 50%;
            object-fit: contain;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
    }

    .card-split {
        max-height: 40%;
        display: flex;
        align-items: center;

        .card-info {
            .title-box {
                display: flex;
                align-items: center;

                .title {
                    margin: 0;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    display: -webkit-box;
                    line-clamp: 1;
                    -webkit-line-clamp: 1;
                    -webkit-box-orient: vertical;
                    font-size: 1.3rem;
                }

                .t_player_num {
                    font-weight: bold;
                    font-size: 0.8rem;
                    color: #747d8c;
                    line-clamp: 1;
                    -webkit-line-clamp: 1;
                    -webkit-box-orient: vertical;
                }
            }
        }

        .card-icon {
            overflow: hidden;
            box-sizing: border-box;
            margin: 0.6rem;
            margin-top: 0;
            height: 4rem;
            min-height: 4rem;
            width: 4rem;
            min-width: 4rem;
            border: 2px solid @border-color;
            border-radius: 50%;
            box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
            display: flex;
            justify-content: center;
            align-items: center;

            img {
                width: 90%;
                height: 90%;
                object-fit: contain;
                border-radius: 50%;
            }
        }
    }

    .card-tags {
        box-sizing: border-box;
        display: flex;
        padding-inline: 0.6rem;
        gap: 0.3rem;
        height: 22px;
        flex-wrap: wrap;
        overflow-y: auto;
        scrollbar-width: none;

        &::-webkit-scrollbar {
            display: none;
        }
    }
}
</style>
