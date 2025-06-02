<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
    siteKey: {
        type: String,
        required: true,
    },
    action: {
        type: String,
        default: '',
    },
    modelValue: String,
})

const emits = defineEmits(['update:modelValue', 'execute'])

const container = ref<HTMLElement | null>(null)
const widgetId = ref<number | null>(null)
const isLoaded = ref(false)
const loading = ref(false)

function loadHCaptcha() {
    return new Promise<void>((resolve, reject) => {
        if (typeof window !== 'undefined' && (window as any).hcaptcha)
            return resolve()
        const script = document.createElement('script')
        script.src = 'https://js.hcaptcha.com/1/api.js?render=explicit'
        script.async = true
        script.defer = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('hCaptcha load failed'))
        document.head.appendChild(script)
    })
}

function onVerify(token: string) {
    emits('update:modelValue', token)
    emits('execute', token)
    loading.value = false
}

function renderCaptcha() {
    if (!container.value || !(window as any).hcaptcha) return
    widgetId.value = (window as any).hcaptcha.render(container.value, {
        sitekey: props.siteKey,
        size: 'invisible',
        callback: onVerify,
    })
}

async function executeCaptcha() {
    if (widgetId.value !== null && (window as any).hcaptcha) {
        loading.value = true
        try {
            await (window as any).hcaptcha.execute(widgetId.value)
        } catch (e) {
            loading.value = false
        }
    }
}

function handleClick(event: Event) {
    event.preventDefault()
    if (!loading.value && isLoaded.value) {
        executeCaptcha()
    }
}

onMounted(async () => {
    try {
        await loadHCaptcha()
        isLoaded.value = true
        renderCaptcha()
    } catch (error) {
        console.error('hCaptcha load error:', error)
    }
})
</script>

<template>
    <div ref="container" @click="handleClick" :disabled="!isLoaded || loading">
        <slot></slot>
    </div>
</template>

<style scoped>
div:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}
</style>
