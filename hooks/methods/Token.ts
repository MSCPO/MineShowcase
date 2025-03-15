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

export const GetToken = getToken()

export const ServerAPI_Token = createAlova({
    baseURL: 'https://mscpoapi.crashvibe.cn/',
    statesHook: VueHook,
    requestAdapter: adapterFetch(),
    // 全局请求拦截器
    beforeRequest({ config }) {
        const token = GetToken.get()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        config.headers['Content-Type'] = 'application/json; charset=utf-8'
    },
    responded: async (response) => ({
        ...(await response.json()),
        code: response.status,
    }),
})
