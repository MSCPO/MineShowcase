import { createAlova } from "alova";
import VueHook from "alova/vue";
import adapterFetch from "alova/fetch";

function getToken() {
  let temp_Token = "";
  return {
    get() {
      if (temp_Token) return temp_Token;
      const token = localStorage.getItem("token");
      if (token) {
        temp_Token = token;
      }
      return temp_Token;
    },
    clear() {
      temp_Token = "";
    },
  };
}

export const GetToken = getToken();

export const ServerAPI_Token = createAlova({
  baseURL: "https://mscpoapi.tblstudio.cn/",
  statesHook: VueHook,
  requestAdapter: adapterFetch(),
  // 全局请求拦截器
  beforeRequest({ config }) {
    // 添加 Token 到请求头
    config.headers.Authorization = `Bearer ${GetToken.get()}`;
    config.headers["Content-Type"] = "application/json; charset=utf-8";
  },
  responded: (response) => response.json(),
});
