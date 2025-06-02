<script setup lang="ts">
import { ref, toRefs, defineProps, watchEffect } from 'vue'
import { VueCropper } from 'vue-cropper'
import { useForm } from 'alova/client'
import { Modal, notification } from 'ant-design-vue'
import 'vue-cropper/dist/index.css'
import type { Gallerys, gallerys_url } from '@/api/models'
import type { add_gallery, ReturnResponse } from '@/api/models'
const { $serverAPI_Token } = useNuxtApp()
const props = defineProps<{
    id: number
    permission: string
    photos: gallerys_url[]
}>()

const isModalOpen = ref(false)
const selectedPhoto = ref<gallerys_url | null>(null)
const currentPhotoIndex = ref<number | null>(null)
const { photos } = toRefs(props)
const galleryPhotos = ref<gallerys_url[]>([])
watchEffect(() => {
    galleryPhotos.value = [...photos.value]
})

const refreshGallery = async () => {
    try {
        const data = await $serverAPI_Token.Get<Gallerys>(
            `/v1/servers/${props.id}/gallerys`,
        )
        if (data.code === 200) {
            galleryPhotos.value = data.gallerys_url
        }
    } catch (err) {
        console.error('refresh gallery failed', err)
    }
}

const openModal = (photo: gallerys_url, index: number) => {
    selectedPhoto.value = photo
    currentPhotoIndex.value = index
    isModalOpen.value = true
}

const closeModal = () => {
    isModalOpen.value = false
}

const prevPhoto = () => {
    if (currentPhotoIndex.value! > 0) {
        currentPhotoIndex.value!--
        selectedPhoto.value = galleryPhotos.value[currentPhotoIndex.value!]
    }
}

const nextPhoto = () => {
    if (currentPhotoIndex.value! < galleryPhotos.value.length - 1) {
        currentPhotoIndex.value!++
        selectedPhoto.value = galleryPhotos.value[currentPhotoIndex.value!]
    }
}

const previewUrl = ref<string | null>('')
const showCropper = ref(false)
const cropper = ref<InstanceType<typeof VueCropper>>()
const fileInput = ref<HTMLInputElement | null>(null)

const GalleryInit = reactive<add_gallery>({
    id: 0,
    title: '',
    description: '',
    image: null,
})

const { form, send: submit } = useForm(
    (Data) => {
        // 转换表单数据并提交
        const formData = new FormData()
        if (Data.image) {
            formData.append('title', Data.title)
            formData.append('description', Data.description)
            formData.append('image', Data.image)
            console.log('FormData  内容:', [...formData.entries()])
        }
        console.log(Data.image)
        return $serverAPI_Token.Post<ReturnResponse>(
            `/v1/servers/${props.id}/gallerys`,
            formData,
        )
    },
    {
        initialForm: GalleryInit,
    },
)
    .onSuccess(async (res) => {
        if (res.data.code === 201) {
            notification.success({ message: '图片上传成功' })
            await refreshGallery()
        } else {
            notification.error({ message: res.data.detail || '上传失败' })
        }
    })
    .onError(() => {
        notification.error({ message: '上传失败' })
    })

const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.files && target.files.length > 0) {
        form.value.image = target.files[0]
        // 生成预览图
        const reader = new FileReader()
        reader.onload = () => {
            previewUrl.value = reader.result as string
            showCropper.value = true // 显示裁剪框
        }
        reader.readAsDataURL(form.value.image)
    }
}

// 打开文件选择框
const openFileInput = () => {
    if (fileInput.value) {
        fileInput.value.click()
    }
}

// 处理裁剪确认
const handleCropOk = () => {
    // 裁剪后图片的处理逻辑
    cropper.value?.getCropBlob((blob: Blob) => {
        if (blob) {
            const ext = form.value.image?.name.split('.').pop() || 'png'
            const newFile = new File([blob], `gallery.${ext}`, {
                type: blob.type,
            })
            form.value.image = newFile
            previewUrl.value = URL.createObjectURL(newFile)
            showCropper.value = false
            submit()
        }
    })
}

// 处理裁剪取消
const handleCropCancel = () => {
    showCropper.value = false
    previewUrl.value = null
    form.value.image = null
}

const confirmDeletePhoto = (photo: gallerys_url, index: number) => {
    Modal.confirm({
        title: '确认删除',
        content: '确定要删除这张图片吗？',
        okText: '删除',
        cancelText: '取消',
        onOk: () => deletePhoto(photo, index),
    })
}

const deletePhoto = async (photo: gallerys_url, index: number) => {
    try {
        await $serverAPI_Token.Delete<ReturnResponse>(
            `/v1/servers/${props.id}/gallerys/${photo.id}`,
        )
        galleryPhotos.value.splice(index, 1)
        closeModal()
        notification.success({ message: '图片删除成功' })
    } catch (err) {
        console.error('delete image failed', err)
    }
}
</script>

<template>
    <div class="gallery-box">
        <!-- 图片列表 -->
        <TransitionGroup name="list" tag="div" class="items" dir="ltr">
            <div
                v-if="permission !== 'guest'"
                class="item add-gallery"
                @click="openFileInput"
                key="add"
            >
                <input
                    type="file"
                    ref="fileInput"
                    style="display: none"
                    accept="image/*"
                    @change="handleFileChange"
                />
                <FileImageOutlined style="font-size: 5rem" />
                <h2>增加图片</h2>
            </div>
            <div
                v-for="(photo, index) in galleryPhotos"
                :key="photo.id"
                class="item"
                @click="openModal(photo, index)"
            >
                <img :src="photo.image_url" />
                <button
                    v-if="permission !== 'guest'"
                    class="delete-button"
                    @click.stop="confirmDeletePhoto(photo, index)"
                >
                    <DeleteOutlined />
                </button>
                <div class="info-overlay">
                    <div class="info-content">
                        <h3 class="title">{{ photo.title }}</h3>
                        <p class="description">{{ photo.description }}</p>
                    </div>
                </div>
            </div>
        </TransitionGroup>
        <!-- 显示大图 -->
        <transition name="modal">
            <div v-if="isModalOpen" class="modal" @click.self="closeModal">
                <div class="modal-content">
                    <transition name="fade" mode="out-in">
                        <img
                            :key="selectedPhoto?.image_url"
                            :src="selectedPhoto?.image_url"
                            class="modal-image"
                        />
                    </transition>
                    <button
                        v-if="permission !== 'guest' && selectedPhoto"
                        class="modal-delete-button"
                        @click.stop="
                            confirmDeletePhoto(
                                selectedPhoto,
                                currentPhotoIndex!,
                            )
                        "
                    >
                        <DeleteOutlined />
                    </button>
                    <div class="modal-controls">
                        <button
                            class="prev-button"
                            @click="prevPhoto"
                            :disabled="currentPhotoIndex === 0"
                        >
                            &lt;
                        </button>
                        <button
                            class="next-button"
                            @click="nextPhoto"
                            :disabled="
                                currentPhotoIndex === galleryPhotos.length - 1
                            "
                        >
                            &gt;
                        </button>
                    </div>
                    <div class="modal-info">
                        <h3 class="title">{{ selectedPhoto?.title }}</h3>
                        <p class="description">
                            {{ selectedPhoto?.description }}
                        </p>
                    </div>
                </div>
            </div>
        </transition>
        <a-modal
            v-model:open="showCropper"
            :maskClosable="false"
            preset="card"
            style="width: 600px"
            title="图片裁切"
            @ok="handleCropOk"
            @cancel="handleCropCancel"
        >
            <div class="form-item">
                <label>图片标题</label>
                <a-input
                    v-model:value="form.title"
                    placeholder="输入图片名称"
                    :maxlength="32"
                    allow-clear
                />
            </div>
            <div class="form-item">
                <label>图片描述</label>
                <a-input
                    v-model:value="form.description"
                    placeholder="该如何描述这张图呢？"
                    allow-clear
                />
            </div>
            <vue-cropper
                ref="cropper"
                :img="previewUrl"
                :full="true"
                :autoCrop="true"
                :fixed="true"
                :infoTrue="true"
                :fixedNumber="[16, 9]"
                :centerBox="true"
                style="height: 400px; width: 100%"
            />
            <template #footer>
                <a-space justify="end">
                    <a-button @click="handleCropCancel">取消</a-button>
                    <a-button type="primary" @click="handleCropOk">
                        确认
                    </a-button>
                </a-space>
            </template>
        </a-modal>
    </div>
</template>

<style lang="less">
@import '@/assets/css/variables.less';

.gallery-box {
    overflow: hidden;
    .items {
        border-radius: 4px;
        display: flex;
        overflow: auto;
        column-gap: 1rem;
        height: 20rem;
        justify-content: flex-start;
        scroll-snap-type: x mandatory;
        scroll-behavior: smooth;

        .add-gallery {
            display: flex;
            width: 60%;
            background-color: @surface-light;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            transition: background-color 0.3s;
            &:hover {
                background-color: @active-primary;
            }
            @media screen and (max-width: 768px) {
                width: 100%;
            }
            @media (prefers-color-scheme: dark) {
                background: @surface-dark;
            }
        }
        .item {
            position: relative;
            scroll-snap-align: start;
            flex-shrink: 0;
            max-width: 100%;
            max-height: 100%;
            height: 100%;
            border-radius: 2px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

            img {
                height: 100%;
                width: auto;
                object-fit: cover;
                border-radius: 4px;
            }

            &:hover {
                .info-overlay {
                    opacity: 1;
                    .info-content {
                        transform: translateY(0);
                    }
                }
            }
            .delete-button {
                position: absolute;
                top: 8px;
                right: 8px;
                background: rgba(0, 0, 0, 0.6);
                border: none;
                color: #fff;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 1;
                transition: background 0.3s;
                pointer-events: auto;
                &:hover {
                    background: rgba(0, 0, 0, 0.8);
                }
            }
        }
        // 自定义滚动条
        &::-webkit-scrollbar {
            height: 8px;
            background-color: transparent;
        }
        &::-webkit-scrollbar-thumb {
            background-color: #c1c1c1;
            border-radius: 4px;
        }
    }
}

.info-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
        180deg,
        rgba(0, 0, 0, 0.6) 0%,
        rgba(0, 0, 0, 0.3) 100%
    );
    opacity: 0;
    transition: all 0.3s ease;
    display: flex;
    align-items: flex-end;
    box-sizing: border-box;
    padding: 1rem;
    pointer-events: none;

    .info-content {
        transform: translateY(20px);
        transition: transform 0.3s ease;
        color: #fff;
        width: 100%;

        .title {
            font-size: 1.2em;
            margin-bottom: 0.5rem;
            font-weight: 600;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            .text-overflow(2);
            @media (prefers-color-scheme: dark) {
                color: @text-color-dark;
            }
        }

        .description {
            font-size: 0.9em;
            line-height: 1.4;
            opacity: 0.9;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
            @media (prefers-color-scheme: dark) {
                color: @text-color-dark;
            }
        }
    }
}

/* 模态框样式 */
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    .form-item {
        margin-bottom: 24px;

        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: @text-color-secondary;
            @media (prefers-color-scheme: dark) {
                color: @text-color-secondary-dark;
            }
        }
    }
}

.modal-content {
    position: relative;
}

.modal-content img {
    object-fit: contain;
    border-radius: 4px;
    width: 140vh;
    max-width: 80vw;
}

.modal-info {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background: linear-gradient(
        180deg,
        rgba(0, 0, 0, 0) 0%,
        rgba(0, 0, 0, 0.6) 100%
    );
    color: white;
    padding: 1rem;
    box-sizing: border-box;
}
@keyframes zoomIn {
    from {
        transform: scale(0.8);
        opacity: 0;
    }
    to {
        transform: scale(1);
        opacity: 1;
    }
}

@keyframes slideUp {
    from {
        transform: translateY(100%);
    }
    to {
        transform: translateY(0);
    }
}
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
    transition: all 0.3s ease;
}

.fade-enter-from {
    opacity: 0;
    transform: scale(0.95);
}

.fade-leave-to {
    opacity: 0;
    transform: scale(1.05);
}
.modal-image {
    object-fit: contain;
}
.modal-controls {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: 0 20px;
    box-sizing: border-box;

    button {
        background: rgba(0, 0, 0, 0.5);
        border: none;
        color: white;
        padding: 15px;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        // 自适应大小
        width: 50px;
        height: 50px;

        &:hover {
            background: rgba(0, 0, 0, 0.8);
            transform: scale(1.1);
        }

        &:disabled {
            opacity: 0.3;
            cursor: not-allowed;
            transform: none;
        }
    }
}

.modal-delete-button {
    position: absolute;
    top: 16px;
    right: 16px;
    background: rgba(0, 0, 0, 0.6);
    border: none;
    color: #fff;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
        background: rgba(0, 0, 0, 0.8);
    }
}

.list-enter-active,
.list-leave-active {
    transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
    opacity: 0;
    transform: scale(0.95);
}
</style>
