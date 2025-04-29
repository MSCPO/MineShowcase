<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import throttle from 'lodash/throttle'
const { $anime } = useNuxtApp()

const gridContainer = ref<HTMLElement | null>(null)
const gridCells = ref<NodeListOf<Element>>()
const gridSize = 80
const gridGap = 12

// 创建网格
const createGrid = throttle(() => {
    if (!gridContainer.value) return

    const container = gridContainer.value
    const width = container.clientWidth
    const height = container.clientHeight

    const columns = Math.ceil(width / gridSize)
    const rows = Math.ceil(height / gridSize)
    const fragment = document.createDocumentFragment()

    container.innerHTML = ''

    for (let i = 0; i < rows * columns; i++) {
        const cell = document.createElement('div')
        cell.className = 'grid-cell'
        fragment.appendChild(cell)
    }

    container.appendChild(fragment)
    gridCells.value = container.querySelectorAll('.grid-cell')

    container.style.gridTemplateColumns = `repeat(${columns}, ${gridSize}px)`
    container.style.gridTemplateRows = `repeat(${rows}, ${gridSize}px)`
}, 100)

// 优化后的鼠标处理
const handleMouseMove = throttle((e: MouseEvent) => {
    if (!gridContainer.value || !gridCells.value) return

    const container = gridContainer.value
    const rect = container.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    gridCells.value.forEach((cell: Element) => {
        const cellEl = cell as HTMLElement
        const cellRect = cellEl.getBoundingClientRect()
        const cellX = cellRect.left - rect.left + cellRect.width / 2
        const cellY = cellRect.top - rect.top + cellRect.height / 2

        const distanceX = mouseX - cellX
        const distanceY = mouseY - cellY
        const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2)

        if (distance < 150) {
            const intensity = 1 - distance / 150
            $anime({
                targets: cellEl,
                scale: 1 + intensity * 0.15,
                translateX: distanceX * 0.05,
                translateY: distanceY * 0.05,
                rotateZ: intensity * 2,
                background: `hsla(200, ${65 + intensity * 30}%, ${80 + intensity * 15}%, ${0.5 + intensity * 0.3})`,
                boxShadow: `inset 0 0 ${intensity * 8}px rgba(255,255,255,${0.2 + intensity * 0.3})`,
                duration: 800,
                easing: 'easeOutExpo',
            })
        } else {
            $anime({
                targets: cellEl,
                scale: 1,
                translateX: 0,
                translateY: 0,
                rotateZ: 0,
                background: 'hsla(200, 65%, 80%, 0.226)',
                boxShadow: 'inset 0 0 0 rgba(255,255,255,0)',
                duration: 1200,
                easing: 'easeOutExpo',
            })
        }
    })
}, 32)

// 防抖处理窗口大小改变
const handleResize = throttle(() => {
    createGrid()
}, 200)

onMounted(() => {
    createGrid()
    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('mousemove', handleMouseMove)
})
</script>

<template>
    <div ref="gridContainer" class="grid-background"></div>
</template>

<style scoped>
.grid-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: grid;
    gap: v-bind(gridGap + 'px');
    background: linear-gradient(45deg, #0f172a, #1e293b);
    z-index: 0;
    pointer-events: none;
    filter: contrast(120%);
}

:global(.grid-cell) {
    position: relative;
    background: hsla(200, 65%, 80%, 0.226);
    border-radius: 6px;
    transition:
        transform 0.6s cubic-bezier(0.23, 1, 0.32, 1),
        background 0.6s ease,
        box-shadow 0.6s ease;
    transform-origin: center;
    will-change: transform, background, box-shadow;
    backdrop-filter: blur(2px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    overflow: hidden;
}

:global(.grid-cell::before) {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(
        circle at 50% 50%,
        rgba(255, 255, 255, 0.1) 0%,
        transparent 70%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
}

:global(.grid-cell:hover::before) {
    opacity: 1;
}

:global(.grid-cell::after) {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: conic-gradient(
        from 0deg,
        transparent 0%,
        rgba(255, 255, 255, 0.1) 30%,
        transparent 70%
    );
    animation: rotate 10s linear infinite;
    opacity: 0.1;
}

@keyframes rotate {
    100% {
        transform: rotate(360deg);
    }
}
</style>
