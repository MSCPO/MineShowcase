<template>
    <!-- 循环渲染当前标签列表 -->
    <template v-for="(tag, index) in currentTags" :key="getTagKey(tag)">
        <!-- 如果标签标签长度超过 20 显示 tooltip -->
        <a-tooltip
            v-if="getTagLabel(tag).length > 20"
            :title="getTagLabel(tag)"
        >
            <a-tag
                :closable="closable && index !== 0"
                :color="color?.color"
                :border-color="color?.borderColor"
                :text-color="color?.textColor"
                :type="!color ? type : undefined"
                :round="round"
                :size="size"
                :class="tagClass"
                :style="tagStyle"
                @close="handleClose(tag)"
            >
                {{
                    renderTag
                        ? renderTag(tag, index)
                        : `${getTagLabel(tag).slice(0, 20)}...`
                }}
            </a-tag>
        </a-tooltip>
        <!-- 标签标签长度不超过 20 直接显示标签 -->
        <a-tag
            v-else
            :closable="closable && index !== 0"
            :color="color?.color"
            :border-color="color?.borderColor"
            :text-color="color?.textColor"
            :type="!color ? type : undefined"
            :round="round"
            :size="size"
            :class="tagClass"
            :style="tagStyle"
            @close="handleClose(tag)"
        >
            {{ renderTag ? renderTag(tag, index) : getTagLabel(tag) }}
        </a-tag>
    </template>
    <!-- 如果未禁用则显示输入框和触发标签 -->
    <template v-if="!disabled">
        <!-- 输入框模板 -->
        <a-input
            v-if="state.inputVisible"
            ref="inputRef"
            v-model:value="state.inputValue"
            type="text"
            size="small"
            style="width: 78px"
            :style="inputStyle"
            :class="inputClass"
            v-bind="inputProps"
            @blur="handleInputConfirm(deactivate)"
            @keyup.enter="handleInputConfirm(deactivate)"
        />
        <!-- 触发标签模板 -->
        <a-tag
            v-else
            :style="{ background: '#fff', borderStyle: 'dashed' }"
            @click="activate"
            :disabled="disabled"
        >
            <PlusOutlined />
            New Tag
        </a-tag>
    </template>
</template>

<script lang="ts" setup>
import { ref, reactive, nextTick, computed } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import type { DynamicTagsOption } from './types' // 假设你有一个 types.ts     文件定义了 DynamicTagsOption

const props = defineProps<{
    closable?: boolean
    color?: { color?: string; borderColor?: string; textColor?: string }
    defaultValue?: string[] | DynamicTagsOption[]
    disabled?: boolean
    inputProps?: Record<string, any>
    inputClass?: string
    inputStyle?: string | Record<string, any>
    max?: number
    round?: boolean
    renderTag?: (tag: string | DynamicTagsOption, index: number) => any
    size?: 'small' | 'medium' | 'large'
    tagClass?: string
    tagStyle?: string | Record<string, any>
    type?: 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error'
    value?: string[] | DynamicTagsOption[]
    onCreate?: (label: string) => string | DynamicTagsOption
}>()

const emits = defineEmits<{
    (event: 'update:value', value: string[] | DynamicTagsOption[]): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const state = reactive({
    inputVisible: false,
    inputValue: '',
})

const currentTags = computed(() => props.value || props.defaultValue || [])

const getTagLabel = (tag: string | DynamicTagsOption) =>
    typeof tag === 'string' ? tag : tag.label
const getTagKey = (tag: string | DynamicTagsOption) =>
    typeof tag === 'string' ? tag : tag.value

const handleClose = (removedTag: string | DynamicTagsOption) => {
    const tags = currentTags.value.filter(
        (tag) => getTagKey(tag) !== getTagKey(removedTag),
    )
    emits('update:value', tags)
}

const activate = () => {
    state.inputVisible = true
    nextTick(() => {
        inputRef.value?.focus()
    })
}

const deactivate = () => {
    state.inputVisible = false
}

const handleInputConfirm = (deactivate: () => void) => {
    const inputValue = state.inputValue
    let tags = currentTags.value
    if (inputValue && !tags.some((tag) => getTagLabel(tag) === inputValue)) {
        const newTag = props.onCreate ? props.onCreate(inputValue) : inputValue
        if (!props.max || tags.length < props.max) {
            tags = [...tags, newTag]
        }
    }
    emits('update:value', tags)
    Object.assign(state, {
        inputVisible: false,
        inputValue: '',
    })
    deactivate()
}
</script>
