import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app'
import { createAlova } from 'alova'
import VueHook from 'alova/vue'
import adapterFetch from 'alova/fetch'

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()

    const serverAPI = createAlova({
        baseURL: config.public.api_backend_url,
        statesHook: VueHook,
        requestAdapter: adapterFetch(),
        responded: async (response) => ({
            ...(await response.json()),
            code: response.status,
        }),
        cacheFor: null,
    })

    return {
        provide: {
            serverAPI,
        },
    }
})
