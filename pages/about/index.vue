<script setup lang="ts">
const { data: testMd, error } = await useAsyncData(() =>
    queryCollection('content').path('/about/we').first(),
)

if (error.value) {
    console.error('Failed to load markdown content:', error.value)
}

const title = useState<string>('pageTitle')
title.value = testMd.value?.title || 'Default Title'

useHead({
    title: title,
})
useSeoMeta({
    title: title || 'Default Title',
    description: testMd.value?.description || 'Default Description',
})
</script>

<template>
    <div class="markdown-container">
        <ContentRenderer v-if="testMd" :value="testMd" class="content" />
        <div v-else>Home not found</div>
    </div>
</template>

<style scoped lang="less">
.markdown-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1rem;
    .content {
        display: block !important;
        :deep(*) {
            // 通用样式
            line-height: 1.6;
            color: #374151;
            max-width: 100%;
        }

        // 标题样式
        :deep(h1) {
            font-size: 2.5rem;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 0.5rem;
            margin: 2rem 0 1.5rem;
        }

        :deep(h2) {
            font-size: 2rem;
            margin: 1.8rem 0 1.2rem;
            color: #1f2937;
        }

        :deep(h3) {
            font-size: 1.5rem;
            margin: 1.5rem 0 1rem;
            color: #374151;
        }

        // 段落和文字
        :deep(p) {
            margin: 1rem 0;
            font-size: 1.1rem;
        }

        :deep(a) {
            text-decoration: none;
            &:hover {
                text-decoration: underline;
            }
        }

        :deep(strong) {
            color: #1f2937;
        }

        :deep(em) {
            color: #4b5563;
        }

        // 列表
        :deep(ul),
        :deep(ol) {
            margin: 1rem 0;
            padding-left: 2rem;
        }

        :deep(li) {
            margin: 0.5rem 0;
            &::marker {
                color: #6b7280;
            }
        }

        // 代码块
        :deep(pre) {
            background-color: #f3f4f6;
            border-radius: 8px;
            padding: 1.5rem;
            margin: 1.5rem 0;
            overflow-x: auto;
            code {
                font-family:
                    'SFMono-Regular', Consolas, 'Liberation Mono', Menlo,
                    monospace;
                font-size: 0.9rem;
                color: #1f2937;
            }
        }

        :deep(code:not(pre code)) {
            background-color: #f3f4f6;
            padding: 0.2em 0.4em;
            border-radius: 4px;
            font-size: 0.9em;
        }

        // 表格
        :deep(table) {
            width: 100%;
            margin: 1.5rem 0;
            border-collapse: collapse;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

            th,
            td {
                padding: 0.75rem;
                border: 1px solid #e5e7eb;
            }

            th {
                background-color: #f9fafb;
                font-weight: 600;
            }

            tr:nth-child(even) {
                background-color: #f9fafb;
            }
        }

        // 引用
        :deep(blockquote) {
            border-left: 4px solid #e5e7eb;
            margin: 1.5rem 0;
            padding: 1rem 1.5rem;
            background-color: #f9fafb;
            color: #4b5563;
            p {
                margin: 0;
            }
        }

        // 图片
        :deep(img) {
            max-width: 100%;
            height: auto;
            margin: 1.5rem auto;
            display: block;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
    }
}
</style>
