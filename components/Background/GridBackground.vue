<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { animate } from 'animejs'

const gridContainer = ref<HTMLElement | null>(null)
const gridSize = 80 // 大格子尺寸
const gridGap = 8 // 增大间隔到8px

// 创建网格
const createGrid = () => {
  if (!gridContainer.value) return
  
  const container = gridContainer.value
  const width = container.clientWidth
  const height = container.clientHeight
  
  // 计算需要的格子数量
  const columns = Math.ceil(width / gridSize)
  const rows = Math.ceil(height / gridSize)
  
  // 清空容器
  container.innerHTML = ''
  
  // 创建格子
  for (let i = 0; i < rows * columns; i++) {
    const cell = document.createElement('div')
    cell.className = 'grid-cell'
    container.appendChild(cell)
  }
  
  // 设置网格样式
  container.style.gridTemplateColumns = `repeat(${columns}, ${gridSize}px)`
  container.style.gridTemplateRows = `repeat(${rows}, ${gridSize}px)`
}

// 处理鼠标移动
const handleMouseMove = (e: MouseEvent) => {
  if (!gridContainer.value) return
  
  const container = gridContainer.value
  const rect = container.getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top
  
  const cells = container.querySelectorAll('.grid-cell')
  
  cells.forEach((cell: Element) => {
    const cellRect = (cell as HTMLElement).getBoundingClientRect()
    const cellX = cellRect.left - rect.left + cellRect.width / 2
    const cellY = cellRect.top - rect.top + cellRect.height / 2
    
    // 计算与鼠标的距离
    const distanceX = mouseX - cellX
    const distanceY = mouseY - cellY
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY)
    
    // 动画效果
    const intensity = 1 - Math.min(distance / 200, 1)
    const hue = 200 // 基础色调
    const saturation = 65 + intensity * 30 // 饱和度动态变化
    const lightness = 80 + intensity * 15 // 亮度动态变化

    if (distance < 200) {
      animate(cell, {
        scale: [1, 1.02 + intensity * 0.03],
        translateX: distanceX * 0.05,
        translateY: distanceY * 0.05,
        background: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
        duration: 60,
        easing: 'spring(1, 80, 10, 0)'
      })
    } else {
      animate(cell, {
        scale: 1,
        translateX: 0,
        translateY: 0,
        background: 'hsl(200, 65%, 80%)',
        duration: 50,
        easing: 'easeOutElastic(1, 0.5)'
      })
    }
  })
}

// 窗口大小改变时重新创建网格
const handleResize = () => {
  createGrid()
}

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
  <div ref="gridContainer" class="grid-background">
  </div>
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
  background-color: transparent;
  z-index: 0;
  pointer-events: auto;
}

:global(.grid-cell) {
  background-color: hsl(200, 65%, 80%);
  border-radius: 4px;
  transition: all 0.3s ease, background-color 0.15s ease;
  transform-origin: center;
  will-change: transform;
  box-shadow: inset 0 0 0 1px rgba(228, 230, 230, 0.1);
}
</style>