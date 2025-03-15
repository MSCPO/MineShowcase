// types.ts

// 定义 DynamicTagsOption 类型
export type DynamicTagsOption = {
    // 标签显示的文本
    label: string
    // 标签的唯一标识
    value: string | number
    // 其他可选属性，可根据实际需求扩展
    [key: string]: any
}

// 定义组件的 Props 类型
export type DynamicTagsProps = {
    // 标签是否可关闭
    closable?: boolean
    // 标签的颜色配置
    color?: {
        color?: string
        borderColor?: string
        textColor?: string
    }
    // 默认标签值
    defaultValue?: string[] | DynamicTagsOption[]
    // 是否禁用组件
    disabled?: boolean
    // 输入框的额外属性
    inputProps?: Record<string, any>
    // 输入框的类名
    inputClass?: string
    // 输入框的样式
    inputStyle?: string | Record<string, any>
    // 标签的最大数量
    max?: number
    // 标签是否为圆角
    round?: boolean
    // 自定义渲染标签的函数
    renderTag?: (tag: string | DynamicTagsOption, index: number) => any
    // 标签和输入框的大小
    size?: 'small' | 'medium' | 'large'
    // 标签的类名
    tagClass?: string
    // 标签的样式
    tagStyle?: string | Record<string, any>
    // 标签的类型
    type?: 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error'
    // 当前标签值
    value?: string[] | DynamicTagsOption[]
    // 创建新标签时的回调函数
    onCreate?: (label: string) => string | DynamicTagsOption
}

// 定义组件的 Emits 类型
export type DynamicTagsEmits = {
    (event: 'update:value', value: string[] | DynamicTagsOption[]): void
}
