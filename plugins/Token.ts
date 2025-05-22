import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app'
import { createAlova } from 'alova'
import VueHook from 'alova/vue'
import adapterFetch from 'alova/fetch'

function getToken() {
    let temp_Token = ''
    return {
        get() {
            if (temp_Token) {
                return temp_Token
            }
            const token = localStorage.getItem('token')
            if (token) {
                temp_Token = token
            }
            return temp_Token
        },
        clear() {
            temp_Token = ''
        },
    }
}

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()
    const GetToken = getToken()

    const serverAPI_Token = createAlova({
        baseURL: config.public.api_backend_url,
        statesHook: VueHook,
        requestAdapter: adapterFetch(),
        // 请求前添加 token
        beforeRequest({ config }) {
            const token = GetToken.get()
            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
        },
        responded: async (response) => ({
            ...(await response.json()),
            code: response.status,
        }),
        cacheFor: null,
    })

    return {
        provide: {
            serverAPI_Token,
        },
    }
})
